import {SimulationConfig} from './SimulationConfig.js';
import {YearMonth} from "./YearMonth.js";
import {PortfolioInvestment} from "./PortfolioInvestment.js";
import {MonthlyPrediction} from "./MonthlyPrediction.js";
import {MonthlyAssetAllocation} from "./MonthlyAssetAllocation.js";
import {historicalPriceReadingService} from "../service/historicalPriceReadingService.js";
import {HistoricalPrice} from "./HistoricalPrice.js";
import {historicalPriceAnalysisService} from "../service/historicalPriceAnalysisService.js";

class Simulation {

    static PORTFOLIO_ASSET_CODE = 'PORTFOLIO'

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

        /** @type {Map<string, number>} */
        this.savedAmountInUsdPerYearMonth = new Map();
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

        // Calculate the saved amount of money every month
        //this.savedAmountInUsdPerYearMonth
        /** @type {YearMonth|null} */
        let nextSavingStartYearMonth = this.config.savings.length === 0 ?
            null : this.config.savings[0].startYearMonth;
        let savingIndex = -1;
        let nbMonthsSinceLastSaving = 0;
        for (const yearMonth of this.portfolioYearMonths) {
            // Check if the next saving period has started
            if (nextSavingStartYearMonth
                && (yearMonth.equals(nextSavingStartYearMonth) || yearMonth.isAfter(nextSavingStartYearMonth))) {
                savingIndex++;
                nextSavingStartYearMonth = savingIndex + 1 >= this.config.savings.length ?
                    null : this.config.savings[savingIndex + 1].startYearMonth;
                nbMonthsSinceLastSaving = 0;
            }

            /** @type {null|Saving} */
            let saving = savingIndex < 0 || savingIndex >= this.config.savings.length ?
                null : this.config.savings[savingIndex];

            let savedAmount = 0;
            if (saving) {
                if (nbMonthsSinceLastSaving === 0) {
                    savedAmount = saving.amountInUsd;
                }
                nbMonthsSinceLastSaving = (nbMonthsSinceLastSaving + 1) % saving.periodInMonths;
            }
            this.savedAmountInUsdPerYearMonth.set(yearMonth.toString(), savedAmount);
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
     * Group monthly asset allocations by year month.
     *
     * @return {Map<string, MonthlyAssetAllocation[]>}
     */
    getPortfolioAllocationsByYearMonth() {
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

        return allocationsByYearMonth;
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
        const allocationsByYearMonth = this.getPortfolioAllocationsByYearMonth();

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

    /**
     * Predict the prices of a portfolio and each of its assets, with an initial investment of one USD.
     * <br/>
     * Note that the portfolio asset code is PORTFOLIO.
     *
     * @return {{assetCode: string, predictionByYearMonth: Map<string, MonthlyPrediction>}[]}
     */
    predictPortfolioAndAssetPricesStartingFromOneUsd() {
        const allocationsByYearMonth = this.getPortfolioAllocationsByYearMonth();

        // Initialize the price of all assets and portfolio to one USD
        /** @type {Map<string, Map<string, MonthlyPrediction>>} */
        const predictionByYearMonthByAssetCode = new Map();
        /** @type {Map<string, number>} */
        let currentPriceByAssetCode = new Map();
        /** @type {string[]} */
        const assetCodes = [];
        for (const investment of this.config.portfolioInvestments) {
            if (investment.enabled) {
                assetCodes.push(investment.assetCode);
                currentPriceByAssetCode.set(investment.assetCode, 1);
                predictionByYearMonthByAssetCode.set(investment.assetCode, new Map());
            }
        }
        currentPriceByAssetCode.set(Simulation.PORTFOLIO_ASSET_CODE, 1);
        predictionByYearMonthByAssetCode.set(Simulation.PORTFOLIO_ASSET_CODE, new Map());

        // Predict the price of each asset and portfolio for each month
        for (const yearMonth of this.portfolioYearMonths) {
            // Predict the price of each asset separately
            for (const assetCode of assetCodes) {
                const currentPrice = currentPriceByAssetCode.get(assetCode);

                const result = this.regressionResultByAssetCode.get(assetCode);
                const avgPriceInUsd = currentPrice * (1 + result.monthlyPerformance);
                const prediction = new MonthlyPrediction(yearMonth, avgPriceInUsd,
                    avgPriceInUsd - 2 * result.standardError / result.startPriceInUsd,
                    avgPriceInUsd + 2 * result.standardError / result.startPriceInUsd);

                currentPriceByAssetCode.set(assetCode, avgPriceInUsd);
                predictionByYearMonthByAssetCode.get(assetCode).set(yearMonth.toString(), prediction);
            }

            // Predict the price of the portfolio
            const allocations = allocationsByYearMonth.get(yearMonth.toString());
            let monthlyPerformance = 0;
            let standardError = 0;
            for (const allocation of allocations) {
                const result = this.regressionResultByAssetCode.get(allocation.assetCode);
                monthlyPerformance += allocation.allocationRatio * result.monthlyPerformance;
                standardError += allocation.allocationRatio * result.standardError / result.startPriceInUsd;
            }
            const currentPrice = currentPriceByAssetCode.get(Simulation.PORTFOLIO_ASSET_CODE);
            const avgPriceInUsd = currentPrice * (1 + monthlyPerformance);
            const prediction = new MonthlyPrediction(yearMonth, avgPriceInUsd,
                avgPriceInUsd - 2 * standardError,
                avgPriceInUsd + 2 * standardError);

            currentPriceByAssetCode.set(Simulation.PORTFOLIO_ASSET_CODE, avgPriceInUsd);
            predictionByYearMonthByAssetCode
                .get(Simulation.PORTFOLIO_ASSET_CODE)
                .set(yearMonth.toString(), prediction);
        }

        // Build the result
        /** @type {{assetCode: string, predictionByYearMonth: Map<string, MonthlyPrediction>}[]} */
        const assetPredictionByYearMonths = [];
        for (const [assetCode, predictionByYearMonth] of predictionByYearMonthByAssetCode) {
            assetPredictionByYearMonths.push({
                assetCode: assetCode,
                predictionByYearMonth: predictionByYearMonth
            });
        }
        return assetPredictionByYearMonths;
    }

    /**
     * Predict the prices of the portfolio.
     *
     * @return {Map<string, MonthlyPrediction>} Prediction by {@link YearMonth}.
     */
    predictPortfolioPrices() {
        /** @type {Map<string, MonthlyPrediction>} */
        const portfolioPredictionByYearMonth = new Map();

        // Initialize the amount of money invested in each asset to zero
        /** @type {Map<string, MonthlyPrediction>} */
        let currentPredictionByAssetCode = new Map();
        /** @type {string[]} */
        const assetCodes = [];
        for (const investment of this.config.portfolioInvestments) {
            if (investment.enabled) {
                assetCodes.push(investment.assetCode);
                currentPredictionByAssetCode.set(investment.assetCode,
                    new MonthlyPrediction(null, 0, 0, 0));
            }
        }

        // Predict the portfolio price every month
        const allocationsByYearMonth = this.getPortfolioAllocationsByYearMonth();
        for (const yearMonth of this.portfolioYearMonths) {
            // Include the monthly performance for each asset
            for (const assetCode of assetCodes) {
                const currentPrediction = currentPredictionByAssetCode.get(assetCode);
                const result = this.regressionResultByAssetCode.get(assetCode);
                const avgPriceInUsd = currentPrediction.avgPriceInUsd * (1 + result.monthlyPerformance);

                const prediction = new MonthlyPrediction(yearMonth, avgPriceInUsd,
                    avgPriceInUsd - 2 * result.standardError / result.startPriceInUsd * avgPriceInUsd,
                    avgPriceInUsd + 2 * result.standardError / result.startPriceInUsd * avgPriceInUsd);
                currentPredictionByAssetCode.set(assetCode, prediction);
            }

            // Calculate the total amount of invested money
            let portfolioPrice = this.savedAmountInUsdPerYearMonth.get(yearMonth.toString());
            for (const [assetCode, prediction] of currentPredictionByAssetCode) {
                portfolioPrice += prediction.avgPriceInUsd;
            }

            /** @type {Map<string, MonthlyAssetAllocation>} */
            const allocationByAssetCode = new Map();
            const allocations = allocationsByYearMonth.get(yearMonth.toString());
            for (const allocation of allocations) {
                allocationByAssetCode.set(allocation.assetCode, allocation);
            }

            // Reallocate the total amount (invested + saved) to the different assets
            for (const assetCode of assetCodes) {
                const allocation = allocationByAssetCode.get(assetCode);
                const prediction = currentPredictionByAssetCode.get(assetCode);
                const result = this.regressionResultByAssetCode.get(assetCode);

                prediction.avgPriceInUsd = portfolioPrice * (allocation ? allocation.allocationRatio : 0);
                const standardError = result.standardError / result.startPriceInUsd * prediction.avgPriceInUsd
                    * (allocation ? allocation.allocationRatio : 0);
                prediction.lower95PriceInUsd = prediction.avgPriceInUsd - 2 * standardError;
                prediction.upper95PriceInUsd = prediction.avgPriceInUsd + 2 * standardError;
            }

            // Calculate the portfolio prediction for this month
            let avgPrice = 0;
            let lower95Price = 0;
            let upper95Price = 0;
            for (const [assetCode, prediction] of currentPredictionByAssetCode) {
                avgPrice += prediction.avgPriceInUsd;
                lower95Price += prediction.lower95PriceInUsd;
                upper95Price += prediction.upper95PriceInUsd;
            }
            portfolioPredictionByYearMonth.set(
                yearMonth.toString(), new MonthlyPrediction(yearMonth, avgPrice, lower95Price, upper95Price));
        }

        return portfolioPredictionByYearMonth;
    }
}

export {Simulation};