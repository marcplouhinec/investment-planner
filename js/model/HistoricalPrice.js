import {LocalDate} from './LocalDate.js';
import {YearMonth} from './YearMonth.js';

class HistoricalPrice {
    /**
     * @param {{
     *     date: LocalDate|string,
     *     priceInUsd: number,
     * }=} properties
     */
    constructor(properties) {
        const sanitizedProperties = properties || {};

        /** @type {LocalDate} */
        this.date = new LocalDate(sanitizedProperties.date);

        /** @type {number} */
        this.priceInUsd = sanitizedProperties.priceInUsd || 0;
    }

    /**
     * Create an array that contains one {@link HistoricalPrice} per month between
     * {@code startYearMonthIncl} and {@code endYearMonthIncl}. Each {@link HistoricalPrice}
     * is the price in which the {@link HistoricalPrice#date} is the closest to the first day of each month.
     *
     * @param {HistoricalPrice[]} historicalPrices
     * @param {YearMonth} startYearMonthIncl
     * @param {YearMonth} endYearMonthIncl
     * @return {{yearMonth: YearMonth, historicalPrice: HistoricalPrice}[]}
     */
    static findAllEveryMonthBetween(historicalPrices, startYearMonthIncl, endYearMonthIncl) {
        /** @type {{{yearMonth: YearMonth, historicalPrice: HistoricalPrice}[]}} */
        const monthlyHistoricalPrices = [];

        if (!historicalPrices || historicalPrices.length === 0) {
            return monthlyHistoricalPrices;
        }

        // Sort the prices by date
        historicalPrices.sort((hPrice1, hPrice2) => LocalDate.compareAsc(hPrice1.date, hPrice2.date));

        // Make sure the range [startYearMonthIncl, endYearMonthIncl] doesn't exceed the historicalPrices
        const startDate = historicalPrices[0].date;
        const endDate = historicalPrices[historicalPrices.length - 1].date;
        if (startYearMonthIncl.isBefore(startDate.toYearMonth())) {
            startYearMonthIncl = startDate.toYearMonth();
        }
        if (endYearMonthIncl.isAfter(endDate.toClosestYearMonth())) {
            endYearMonthIncl = endDate.toClosestYearMonth();
        }

        // Iterate over the prices
        let targetYearMonth = startYearMonthIncl;
        /** @type {?HistoricalPrice} */ let prevHistoricalPrice = null;
        /** @type {?HistoricalPrice} */ let currHistoricalPrice = null;
        for (let i = 0; i < historicalPrices.length; i++) {
            if (targetYearMonth.isAfter(endYearMonthIncl)) {
                break;
            }

            prevHistoricalPrice = currHistoricalPrice;
            currHistoricalPrice = historicalPrices[i];
            const targetDate = targetYearMonth.atDay(1);

            if (currHistoricalPrice.date.isBefore(targetDate)) {
                continue;
            }

            if (currHistoricalPrice.date.equals(targetDate)) {
                monthlyHistoricalPrices.push({
                    yearMonth: targetYearMonth,
                    historicalPrice: currHistoricalPrice
                });
                targetYearMonth = targetYearMonth.nextMonth();
                continue;
            }

            // Note: we know that currHistoricalPrice.date.isAfter(targetDate)
            if (prevHistoricalPrice && prevHistoricalPrice.date.isBefore(targetDate)) {
                // Choose the closest price
                const nbDaysToPrevPrice = prevHistoricalPrice.date.nbDaysUntil(targetDate);
                const nbDaysToNextPrice = targetDate.nbDaysUntil(currHistoricalPrice.date);
                const closestHPrice = nbDaysToPrevPrice < nbDaysToNextPrice ? prevHistoricalPrice : currHistoricalPrice;

                monthlyHistoricalPrices.push({
                    yearMonth: targetYearMonth,
                    historicalPrice: closestHPrice
                });
                targetYearMonth = targetYearMonth.nextMonth();
            }
        }

        return monthlyHistoricalPrices;
    }
}

export {HistoricalPrice};