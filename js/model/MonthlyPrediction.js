import {YearMonth} from './YearMonth.js'

class MonthlyPrediction {

    /**
     * @param {YearMonth} yearMonth
     * @param {number} avgPriceInUsd
     * @param {number} lower95PriceInUsd
     * @param {number} upper95PriceInUsd
     */
    constructor(yearMonth, avgPriceInUsd, lower95PriceInUsd, upper95PriceInUsd) {
        /** @type {YearMonth} */
        this.yearMonth = yearMonth;
        /** @type {number} */
        this.avgPriceInUsd = avgPriceInUsd;
        /** @type {number} */
        this.lower95PriceInUsd = lower95PriceInUsd;
        /** @type {number} */
        this.upper95PriceInUsd = upper95PriceInUsd;
    }

}

export {MonthlyPrediction};