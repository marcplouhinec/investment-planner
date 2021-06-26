import {YearMonth} from './YearMonth.js';

class Saving {

    /**
     * @param {YearMonth} startYearMonth
     * @param {number} periodInMonths
     * @param {number} amountInUsd
     */
    constructor(startYearMonth, periodInMonths, amountInUsd) {
        /** @type {YearMonth} */
        this.startYearMonth = startYearMonth;
        /** @type {number} */
        this.periodInMonths = periodInMonths;
        /** @type {number} */
        this.amountInUsd = amountInUsd;
    }

    /**
     * @param {{
     *     startYearMonth: YearMonth,
     *     periodInMonths: number,
     *     amountInUsd: number
     * }|null} properties
     * @return {Saving}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        const startYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.startYearMonth);
        const periodInMonths = properties.periodInMonths || 0;
        const amountInUsd = properties.amountInUsd || 0;

        return new Saving(startYearMonth, periodInMonths, amountInUsd);
    }
}

export {Saving};