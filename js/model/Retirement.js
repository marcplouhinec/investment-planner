import {YearMonth} from './YearMonth.js';

class Retirement {

    /**
     * @param {YearMonth} startYearMonth
     * @param {number} monthlyPensionInUsd
     * @param {number} pensionAnnualInflation
     */
    constructor(startYearMonth, monthlyPensionInUsd, pensionAnnualInflation) {
        /** @type {YearMonth} */
        this.startYearMonth = startYearMonth;
        /** @type {number} */
        this.monthlyPensionInUsd = monthlyPensionInUsd;
        /** @type {number} */
        this.pensionAnnualInflation = pensionAnnualInflation;
    }

    /**
     * @param {{
     *     startYearMonth: YearMonth,
     *     monthlyPensionInUsd: number,
     *     pensionAnnualInflation: number
     * }|null} properties
     * @return {Retirement}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        const startYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.startYearMonth);
        const monthlyPensionInUsd = sanitizedProperties.monthlyPensionInUsd || 0;
        const pensionAnnualInflation = sanitizedProperties.pensionAnnualInflation || 0;

        return new Retirement(startYearMonth, monthlyPensionInUsd, pensionAnnualInflation);
    }
}

export {Retirement};