import {YearMonth} from './YearMonth.js';

class PortfolioInvestment {

    /**
     * @param {{
     *     assetCode: string|undefined,
     *     phase1StartYearMonth: YearMonth|string|undefined,
     *     phase1InitialWeight: number|undefined,
     *     phase1FinalWeight: number|undefined,
     *     phase2StartYearMonth: YearMonth|string|undefined,
     *     phase2FinalWeight: number|undefined,
     *     phase3StartYearMonth: YearMonth|string|undefined,
     *     phase3FinalWeight: number|undefined,
     *     phase3EndYearMonth: YearMonth|string|undefined,
     *     enabled: boolean|undefined
     * }=} properties
     */
    constructor(properties) {
        const sanitizedProperties = properties || {};

        /** @type {string} */
        this.assetCode = sanitizedProperties.assetCode || '';
        /** @type {YearMonth} */
        this.phase1StartYearMonth = new YearMonth(sanitizedProperties.phase1StartYearMonth);
        /** @type {number} */
        this.phase1InitialWeight = sanitizedProperties.phase1InitialWeight || 0;
        /** @type {number} */
        this.phase1FinalWeight = sanitizedProperties.phase1FinalWeight || 0;
        /** @type {YearMonth} */
        this.phase2StartYearMonth = new YearMonth(sanitizedProperties.phase2StartYearMonth);
        /** @type {number} */
        this.phase2FinalWeight = sanitizedProperties.phase2FinalWeight || 0;
        /** @type {YearMonth} */
        this.phase3StartYearMonth = new YearMonth(sanitizedProperties.phase3StartYearMonth);
        /** @type {number} */
        this.phase3FinalWeight = sanitizedProperties.phase3FinalWeight || 0;
        /** @type {YearMonth} */
        this.phase3EndYearMonth = new YearMonth(sanitizedProperties.phase3EndYearMonth);
        /** @type {boolean} */
        this.enabled = typeof sanitizedProperties.enabled === 'boolean' ? sanitizedProperties.enabled : true;
    }

    /**
     * @param {YearMonth} yearMonth
     * @return {?number}
     */
    computeWeightAt(yearMonth) {
        // Stop here if we are outside of the scope of this investment
        if (yearMonth.isBefore(this.phase1StartYearMonth) || yearMonth.isAfter(this.phase3EndYearMonth)) {
            return null;
        }

        // Find the weight range
        let startWeight = 0;
        let endWeight = 0;
        let startYearMonth = this.phase1StartYearMonth;
        let endYearMonth = this.phase3EndYearMonth;

        if (yearMonth.equals(this.phase1StartYearMonth)
            || (yearMonth.isAfter(this.phase1StartYearMonth) && yearMonth.isBefore(this.phase2StartYearMonth))) {
            startWeight = this.phase1InitialWeight;
            endWeight = this.phase1FinalWeight;
            startYearMonth = this.phase1StartYearMonth;
            endYearMonth = this.phase2StartYearMonth;
        } else if (yearMonth.equals(this.phase2StartYearMonth)
            || (yearMonth.isAfter(this.phase2StartYearMonth) && yearMonth.isBefore(this.phase3StartYearMonth))) {
            startWeight = this.phase1FinalWeight;
            endWeight = this.phase2FinalWeight;
            startYearMonth = this.phase2StartYearMonth;
            endYearMonth = this.phase3StartYearMonth;
        } else {
            startWeight = this.phase2FinalWeight;
            endWeight = this.phase3FinalWeight;
            startYearMonth = this.phase3StartYearMonth;
            endYearMonth = this.phase3EndYearMonth;
        }

        // Calculate the current weight
        const totalNbMonths = YearMonth.nbMonthsBetween(startYearMonth, endYearMonth);
        const nbMonths = YearMonth.nbMonthsBetween(startYearMonth, yearMonth);
        const weightDiff = endWeight - startWeight;

        return startWeight + nbMonths * (weightDiff / totalNbMonths);
    }

    /**
     * @param {PortfolioInvestment[]} portfolioInvestments
     * @return {?YearMonth}
     */
    static findStartYearMonth(portfolioInvestments) {
        const yearMonths = portfolioInvestments
            .filter(it => it.enabled)
            .map(it => it.phase1StartYearMonth)
            .sort(YearMonth.compareAsc);

        if (yearMonths.length === 0) {
            return null;
        }
        return yearMonths[0];
    }

    /**
     * @param {PortfolioInvestment[]} portfolioInvestments
     * @return {?YearMonth}
     */
    static findEndYearMonth(portfolioInvestments) {
        const yearMonths = portfolioInvestments
            .filter(it => it.enabled)
            .map(it => it.phase3EndYearMonth)
            .sort(YearMonth.compareDesc);

        if (yearMonths.length === 0) {
            return null;
        }
        return yearMonths[0];
    }
}

export {PortfolioInvestment};