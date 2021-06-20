import {LocalDate} from './LocalDate.js'
import {HistoricalPrice} from './HistoricalPrice.js'

/**
 * Result of a regression computed on an array of {@link HistoricalPrice}s.
 *
 * The {@link #startPriceInUsd} and the {@link #monthlyPerformance} correspond to the following
 * formula: `priceInUsd = startPriceInUsd * (1 + monthlyPerformance)^nbMonths`, where `nbMonths` is the
 * number of months of investment, and `priceInUsd` is the value of the invested money at the end of the
 * investment period.
 */
class RegressionResult {

    /**
     * @param {LocalDate} startDate
     * @param {LocalDate} endDate
     * @param {number} startPriceInUsd
     * @param {number} monthlyPerformance
     * @param {number} standardError a.k.a. Root-mean-square deviation
     */
    constructor(startDate,
                endDate,
                startPriceInUsd,
                monthlyPerformance,
                standardError) {
        /** @type {LocalDate} */
        this.startDate = startDate;
        /** @type {LocalDate} */
        this.endDate = endDate;
        /** @type {number} */
        this.startPriceInUsd = startPriceInUsd;
        /** @type {number} */
        this.monthlyPerformance = monthlyPerformance;
        /** @type {number} */
        this.standardError = standardError;
    }
}

export {RegressionResult};