import {YearMonth} from './YearMonth.js';

class PortfolioInvestment {

    /**
     * @param {string} assetCode
     * @param {YearMonth} phase1StartYearMonth
     * @param {number} phase1InitialWeight
     * @param {number} phase1FinalWeight
     * @param {YearMonth} phase2StartYearMonth
     * @param {number} phase2FinalWeight
     * @param {YearMonth} phase3StartYearMonth
     * @param {number} phase3FinalWeight
     * @param {YearMonth} phase3EndYearMonth
     * @param {boolean} enabled
     */
    constructor(assetCode,
                phase1StartYearMonth, phase1InitialWeight, phase1FinalWeight,
                phase2StartYearMonth, phase2FinalWeight,
                phase3StartYearMonth, phase3FinalWeight, phase3EndYearMonth,
                enabled) {
        /** @type {string} */
        this.assetCode = assetCode;
        /** @type {YearMonth} */
        this.phase1StartYearMonth = phase1StartYearMonth;
        /** @type {number} */
        this.phase1InitialWeight = phase1InitialWeight;
        /** @type {number} */
        this.phase1FinalWeight = phase1FinalWeight;
        /** @type {YearMonth} */
        this.phase2StartYearMonth = phase2StartYearMonth;
        /** @type {number} */
        this.phase2FinalWeight = phase2FinalWeight;
        /** @type {YearMonth} */
        this.phase3StartYearMonth = phase3StartYearMonth;
        /** @type {number} */
        this.phase3FinalWeight = phase3FinalWeight;
        /** @type {YearMonth} */
        this.phase3EndYearMonth = phase3EndYearMonth;
        /** @type {boolean} */
        this.enabled = enabled;
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
        let startWeight;
        let endWeight;
        let startYearMonth;
        let endYearMonth;

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
     * @return {PortfolioInvestment}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        /** @type {string} */
        const assetCode = sanitizedProperties.assetCode || '';
        /** @type {YearMonth} */
        const phase1StartYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.phase1StartYearMonth);
        /** @type {number} */
        const phase1InitialWeight = sanitizedProperties.phase1InitialWeight || 0;
        /** @type {number} */
        const phase1FinalWeight = sanitizedProperties.phase1FinalWeight || 0;
        /** @type {YearMonth} */
        const phase2StartYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.phase2StartYearMonth);
        /** @type {number} */
        const phase2FinalWeight = sanitizedProperties.phase2FinalWeight || 0;
        /** @type {YearMonth} */
        const phase3StartYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.phase3StartYearMonth);
        /** @type {number} */
        const phase3FinalWeight = sanitizedProperties.phase3FinalWeight || 0;
        /** @type {YearMonth} */
        const phase3EndYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.phase3EndYearMonth);
        /** @type {boolean} */
        const enabled = typeof sanitizedProperties.enabled === 'boolean' ? sanitizedProperties.enabled : true;

        return new PortfolioInvestment(
            assetCode,
            phase1StartYearMonth, phase1InitialWeight, phase1FinalWeight,
            phase2StartYearMonth, phase2FinalWeight,
            phase3StartYearMonth, phase3FinalWeight, phase3EndYearMonth,
            enabled);
    }
}

export {PortfolioInvestment};