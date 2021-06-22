import {SimulationConfig} from './SimulationConfig.js';
import {YearMonth} from "./YearMonth.js";
import {PortfolioInvestment} from "./PortfolioInvestment.js";
import {MonthlyAssetAllocation} from "./MonthlyAssetAllocation.js";
import {historicalPriceReadingService} from "../service/historicalPriceReadingService.js";
import {HistoricalPrice} from "./HistoricalPrice.js";
import {historicalPriceAnalysisService} from "../service/historicalPriceAnalysisService.js";

class Simulation {

    constructor() {
        /** @type {SimulationConfig} */
        this.config = SimulationConfig.parseProperties({});

        /**
         * YearMonths in which the portfolio is defined.
         * @type {YearMonth[]}
         */
        this.portfolioYearMonths = [];

        /** @type {MonthlyAssetAllocation[]} */
        this.monthlyAssetAllocations = [];

        /** @type {Map<string, HistoricalPrice[]>} */
        this.historicalPricesByAssetCode = new Map();

        /** @type {Map<string, {yearMonth: YearMonth, historicalPrice: HistoricalPrice}[]>} */
        this.monthlyHistoricalPricesByAssetCode = new Map();

        /** @type {Map<string, {performance: number, stdDev: number}>} */
        this.annualizedPerfAndStdDevByAssetCode = new Map();

        /** @type {Map<string, RegressionResult>} */
        this.regressionResultByAssetCode = new Map();

        /** @type {Map<string, MonthlyPrediction[]>} */
        this.monthlyPredictionsByAssetCode = new Map();
    }

    /**
     * @param {SimulationConfig} config
     */
    async update(config) {
        this.config = config;

        // Generate a range of months in which the portfolio is defined
        this.portfolioYearMonths = YearMonth.generateRangeBetween(
            PortfolioInvestment.findStartYearMonth(config.portfolioInvestments),
            PortfolioInvestment.findEndYearMonth(config.portfolioInvestments));

        // Update the monthly asset allocations
        const enabledInvestments = config.portfolioInvestments.filter(investment => investment.enabled);
        this.monthlyAssetAllocations = [];
        for (let yearMonth of this.portfolioYearMonths) {
            // Compute the weight of each investment at this yearMonth
            const investmentWeights = [];
            for (let i = 0; i < enabledInvestments.length; i++) {
                const investment = enabledInvestments[i];
                investmentWeights.push(investment.computeWeightAt(yearMonth));
            }
            const totalWeight = investmentWeights.reduce((a, b) => a + b);

            // Compute the allocations
            for (let i = 0; i < enabledInvestments.length; i++) {
                const investment = enabledInvestments[i];
                const weight = investmentWeights[i];
                this.monthlyAssetAllocations.push(new MonthlyAssetAllocation(
                    yearMonth, investment.assetCode, weight, weight / totalWeight));
            }
        }

        // Load the asset prices
        for (let asset of config.assets) {
            if (!this.historicalPricesByAssetCode.has(asset.code)) {
                const prices = await historicalPriceReadingService.readHistoricalPrices(asset);
                this.historicalPricesByAssetCode.set(asset.code, prices);
            }
        }

        // Extract the closest price for each month for each asset
        for (let asset of config.assets) {
            if (!this.monthlyHistoricalPricesByAssetCode.has(asset.code)) {
                const historicalPrices = this.historicalPricesByAssetCode.get(asset.code);
                this.monthlyHistoricalPricesByAssetCode.set(
                    asset.code,
                    HistoricalPrice.findAllEveryMonthBetween(
                        historicalPrices, config.scope.startYearMonth, config.scope.endYearMonth));
            }
        }

        // Calculate the annualized performance and standard deviation for all assets
        for (let asset of config.assets) {
            if (!this.annualizedPerfAndStdDevByAssetCode.has(asset.code)) {
                const prices = this.historicalPricesByAssetCode.get(asset.code);

                this.annualizedPerfAndStdDevByAssetCode.set(asset.code, {
                    performance: historicalPriceAnalysisService.calculateAnnualizedPerformance(
                        prices, config.scope.startYearMonth, config.scope.endYearMonth),
                    stdDev: historicalPriceAnalysisService.calculateAnnualizedPerformanceStandardDeviation(
                        prices, config.scope.startYearMonth, config.scope.endYearMonth)
                });
            }
        }

        // Calculate a regression for all assets
        for (let asset of config.assets) {
            if (!this.regressionResultByAssetCode.has(asset.code)) {
                const prices = this.historicalPricesByAssetCode.get(asset.code);

                this.regressionResultByAssetCode.set(asset.code,
                    historicalPriceAnalysisService.calculateRegression(
                        prices, config.scope.startYearMonth, config.scope.endYearMonth));
            }
        }

        // Calculate monthly predictions for all assets
        for (let asset of config.assets) {
            if (!this.monthlyPredictionsByAssetCode.has(asset.code)) {
                const regressionResult = this.regressionResultByAssetCode.get(asset.code);
                this.monthlyPredictionsByAssetCode.set(asset.code,
                    historicalPriceAnalysisService.generateMonthlyPredictions(
                        regressionResult, config.scope.endYearMonth));
            }
        }
    }

    /**
     * @return {Map<string, Map<string, MonthlyAssetAllocation>>}
     */
    getPortfolioMonthlyAssetAllocationByYearMonthByAssetCode() {
        const allocationByYearMonthByAssetCode = new Map();

        for (let allocation of this.monthlyAssetAllocations) {
            let allocationByYearMonth = allocationByYearMonthByAssetCode.get(allocation.assetCode);

            if (!allocationByYearMonth) {
                allocationByYearMonth = new Map();
                allocationByYearMonthByAssetCode.set(allocation.assetCode, allocationByYearMonth);
            }

            allocationByYearMonth.set(allocation.yearMonth.toString(), allocation);
        }

        return allocationByYearMonthByAssetCode;
    }

    /**
     * @return {{year: number, monthlyPerformance: number, standardError: number}[]}
     */
    getAllPortfolioMonthlyPerformanceAndStandardErrorPerYear() {
        // Find the earliest January
        let firstYear = 0;
        for (const yearMonth of this.portfolioYearMonths) {
            if (yearMonth.month === 1) {
                firstYear = yearMonth.year;
                break;
            }
        }

        // Find the latest January
        let lastYear = 0;
        for (let i = this.portfolioYearMonths.length - 1; i >= 0; i--) {
            const yearMonth = this.portfolioYearMonths[i];
            if (yearMonth.month === 1) {
                lastYear = yearMonth.year;
                break;
            }
        }

        // Group monthly asset allocations by year month
        /** @type {Map<string, MonthlyAssetAllocation[]>} */
        const allocationsByYearMonth = new Map();
        for (let allocation of this.monthlyAssetAllocations) {
            const formattedYearMonth = allocation.yearMonth.toString();
            let allocations = allocationsByYearMonth.get(formattedYearMonth);

            if (!allocations) {
                allocations = [];
                allocationsByYearMonth.set(formattedYearMonth, allocations);
            }

            allocations.push(allocation);
        }

        // Calculate the monthly performance and standard error per year
        /** @type {{year: number, monthlyPerformance: number, standardError: number}[]} */
        const portfolioMonthlyPerformanceAndStandardErrorPerYear = [];
        for (let year = firstYear; year <= lastYear; year++) {
            const januaryAllocations = allocationsByYearMonth.get(new YearMonth(year, 1).toString());

            let monthlyPerformance = 0;
            let standardError = 0;
            for (const januaryAllocation of januaryAllocations) {
                const result = this.regressionResultByAssetCode.get(januaryAllocation.assetCode);
                monthlyPerformance += result.monthlyPerformance * januaryAllocation.allocationRatio;
                standardError += result.standardError * januaryAllocation.allocationRatio;
            }

            portfolioMonthlyPerformanceAndStandardErrorPerYear.push({
                year, monthlyPerformance, standardError
            });
        }

        return portfolioMonthlyPerformanceAndStandardErrorPerYear;
    }
}

export {Simulation};