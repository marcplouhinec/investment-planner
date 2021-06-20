import {SimulationConfig} from './SimulationConfig.js';
import {YearMonth} from "./YearMonth.js";
import {PortfolioInvestment} from "./PortfolioInvestment.js";
import {MonthlyAssetAllocation} from "./MonthlyAssetAllocation.js";

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
    }

    /**
     * @param {SimulationConfig} config
     */
    update(config) {
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
}

export {Simulation};