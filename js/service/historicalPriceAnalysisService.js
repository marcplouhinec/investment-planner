import {HistoricalPrice} from '../model/HistoricalPrice.js';
import {YearMonth} from '../model/YearMonth.js';
import {LocalDate} from '../model/LocalDate.js';

const historicalPriceAnalysisService = {

    /**
     * @param {HistoricalPrice[]} historicalPrices
     * @param {YearMonth} minYearMonth
     * @param {YearMonth} maxYearMonth
     * @return {number} Annualized return.
     */
    calculateAnnualizedPerformance: function (historicalPrices, minYearMonth, maxYearMonth) {
        const minMaxLocalDates = this._findClosestAvailableMinMaxLocalDates(historicalPrices, minYearMonth, maxYearMonth);
        const startDate = minMaxLocalDates.startDate;
        const endDate = minMaxLocalDates.endDate;

        const startPrice = historicalPrices.filter(it => it.date.equals(startDate))[0].priceInUsd;
        const endPrice = historicalPrices.filter(it => it.date.equals(endDate))[0].priceInUsd;
        const nbYears = minYearMonth.nbYearsUntil(maxYearMonth);
        const overallPerformance = (endPrice - startPrice) / startPrice;
        return Math.pow(1 + overallPerformance, 1.0 / nbYears) - 1;
    },

    /**
     * @param {HistoricalPrice[]} historicalPrices
     * @param {YearMonth} minYearMonth
     * @param {YearMonth} maxYearMonth
     * @return {number} Annualized performance standard deviation.
     */
    calculateAnnualizedPerformanceStandardDeviation: function (historicalPrices, minYearMonth, maxYearMonth) {
        const minMaxLocalDates = this._findClosestAvailableMinMaxLocalDates(historicalPrices, minYearMonth, maxYearMonth);
        const startDate = minMaxLocalDates.startDate;
        const endDate = minMaxLocalDates.endDate;

        // Calculate the performance for each month
        const historicalPricesInRange = historicalPrices
            .filter(it => it.date.equals(startDate) || it.date.isAfter(startDate))
            .filter(it => it.date.equals(endDate) || it.date.isBefore(endDate));

        /** @type {number[]} */ const performances = [];
        for (let i = 1; i < historicalPricesInRange.length; i++) {
            const currentPrice = historicalPricesInRange[i].priceInUsd;
            const previousPrice = historicalPricesInRange[i - 1].priceInUsd;
            const performance = (currentPrice - previousPrice) / previousPrice;
            performances.push(performance);
        }

        // Calculate the standard deviation of the performance
        const stdDev = this._calculateSampleStandardDeviation(performances);

        // Calculate the annualized standard deviation
        return stdDev * Math.sqrt(12);
    },

    /**
     * @param {HistoricalPrice[]} historicalPrices
     * @param {YearMonth} minYearMonth
     * @param {YearMonth} maxYearMonth
     * @return {{startDate: LocalDate, endDate: LocalDate}}
     */
    _findClosestAvailableMinMaxLocalDates: function (historicalPrices, minYearMonth, maxYearMonth) {
        const minDate = minYearMonth.atDay(1);
        const maxDate = maxYearMonth.atDay(1);

        const historicalDates = historicalPrices.map(it => it.date);

        return {
            startDate: LocalDate.findClosestAvailableLocalDate(historicalDates, minDate),
            endDate: LocalDate.findClosestAvailableLocalDate(historicalDates, maxDate)
        };
    },

    /**
     * @see https://www.thoughtco.com/calculate-a-sample-standard-deviation-3126345
     * @param {number[]} array
     * @return {number}
     */
    _calculateSampleStandardDeviation: function (array) {
        const n = array.length - 1; // We use the "sample" standard deviation, so we divide by n - 1
        const mean = array.reduce((a, b) => a + b) / n;
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    }
};

export {historicalPriceAnalysisService};