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
    calculateAnnualPerformance: function (historicalPrices, minYearMonth, maxYearMonth) {
        const minDate = minYearMonth.atDay(1);
        const maxDate = maxYearMonth.atDay(1);

        const historicalDates = historicalPrices.map(it => it.date);
        const startDate = LocalDate.findClosestAvailableLocalDate(historicalDates, minDate);
        const endDate = LocalDate.findClosestAvailableLocalDate(historicalDates, maxDate);

        const startPrice = historicalPrices.filter(it => it.date.equals(startDate))[0].priceInUsd;
        const endPrice = historicalPrices.filter(it => it.date.equals(endDate))[0].priceInUsd;
        const nbYears = minYearMonth.nbYearsUntil(maxYearMonth);
        const overallPerformance = (endPrice - startPrice) / startPrice;
        return Math.pow(1 + overallPerformance, 1.0 / nbYears) - 1;
    }

};

export {historicalPriceAnalysisService};