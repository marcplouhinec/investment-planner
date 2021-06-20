import {HistoricalPrice} from '../model/HistoricalPrice.js';
import {YearMonth} from '../model/YearMonth.js';
import {LocalDate} from '../model/LocalDate.js';
import {RegressionResult} from '../model/RegressionResult.js';

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
        const nbYears = startDate.toClosestYearMonth().nbYearsUntil(endDate.toClosestYearMonth());
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
     * @return {RegressionResult}
     */
    calculateRegression: function (historicalPrices, minYearMonth, maxYearMonth) {
        // A linear regression provides the coefficients `B0` and `B1` for a formula `y = B0 + B1 * x`,
        // however, our target formula is `y = s * (1 + p)^x`, where `s` is the initial price of the
        // asset, `p` is the monthly performance, `x` is the number of months of investment, and `y` is
        // the estimated asset price.
        // The solution is to use the natural logarithm like this: ln(y) = ln(s) + x * ln(1 + p),
        // thus, we can use a simple linear regression as our formula becomes linear.

        const monthlyHistoricalPrices = HistoricalPrice.findAllEveryMonthBetween(historicalPrices, minYearMonth, maxYearMonth);

        // Build the points on which we compute the linear regression
        const points = monthlyHistoricalPrices.map((mhp, index) => {
            return {
                x: index,
                y: Math.log(mhp.historicalPrice.priceInUsd)
            };
        });
        const result = this._computeLinearRegression(points);

        // Convert the results back to prices and performances
        const startPriceInUsd = Math.exp(result.yIntersect);
        const performance = Math.exp(result.slope) - 1;

        // Compute the standard error
        const observedValues = [];
        const predictedValues = [];
        for (let i = 0; i < monthlyHistoricalPrices.length; i++) {
            observedValues.push(monthlyHistoricalPrices[i].historicalPrice.priceInUsd);
            predictedValues.push(startPriceInUsd * Math.pow(1 + performance, i));
        }
        const standardError = this._computeStandardError(observedValues, predictedValues);

        // Build the response
        const startDate = monthlyHistoricalPrices[0].historicalPrice.date;
        const endDate = monthlyHistoricalPrices[monthlyHistoricalPrices.length - 1].historicalPrice.date;
        return new RegressionResult(startDate, endDate, startPriceInUsd, performance, standardError);
    },

    /**
     * @param {RegressionResult} regressionResult
     * @param {YearMonth} endYearMonth
     * @return {{yearMonth: YearMonth, avgPriceInUsd: number}[]}
     */
    generateMonthlyEstimations: function (regressionResult,
                                          endYearMonth) {
        const startYearMonth = regressionResult.startDate.toYearMonth();

        return YearMonth.generateRangeBetween(startYearMonth, endYearMonth)
            .map((yearMonth, index) => {
                return {
                    yearMonth: yearMonth,
                    avgPriceInUsd: regressionResult.startPriceInUsd * Math.pow(1 + regressionResult.monthlyPerformance, index)
                };
            });
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
    },

    /**
     * @param {{x: number, y: number}[]} points
     * @return {{yIntersect: number, slope: number}}
     */
    _computeLinearRegression: function (points) {
        const averageX = points.map(p => p.x).reduce((a, b) => a + b) / points.length;
        const averageY = points.map(p => p.y).reduce((a, b) => a + b) / points.length;

        const nominator = points.map(p => (p.x - averageX) * (p.y - averageY)).reduce((a, b) => a + b);
        const denominator = points.map(p => Math.pow(p.x - averageX, 2)).reduce((a, b) => a + b);
        const slope = nominator / denominator;

        return {
            yIntersect: averageY - slope * averageX,
            slope: slope
        };
    },

    /**
     * @param {number[]} observedValues
     * @param {number[]} predictedValues
     * @return {number}
     */
    _computeStandardError: function (observedValues, predictedValues) {
        if (!observedValues || !predictedValues
            || observedValues.length === 0 || observedValues.length !== predictedValues.length) {
            return 0;
        }

        const nbValues = observedValues.length;
        let residualsSum = 0;
        for (let i = 0; i < nbValues; i++) {
            residualsSum += Math.pow(observedValues[i] - predictedValues[i], 2);
        }

        return Math.sqrt(residualsSum / (nbValues - 2));
    }
};

export {historicalPriceAnalysisService};