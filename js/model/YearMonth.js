import {Year} from './Year.js';
import {LocalDate} from './LocalDate.js';

class YearMonth {

    /**
     * @param {{
     *     year: number,
     *     month: number
     * }|string|null} properties
     * @throws Error if the value is not parsable.
     */
    constructor(properties) {
        const sanitizedProperties = YearMonth._parseProperties(properties);

        /** @type {number} */
        this.year = sanitizedProperties.year;

        /** @type {number} */
        this.month = sanitizedProperties.month;
    }

    /**
     * @param {YearMonth} yearMonth
     * @return boolean
     */
    isBefore(yearMonth) {
        return this.year < yearMonth.year || (this.year === yearMonth.year && this.month < yearMonth.month);
    }

    /**
     * @param {YearMonth} yearMonth
     * @return boolean
     */
    isAfter(yearMonth) {
        return yearMonth.isBefore(this);
    }

    /**
     * @return {number} Number of days in the current month.
     */
    nbDaysInMonth() {
        switch (this.month) {
            case 2:
                return (Year.isLeapYear(this.year) ? 29 : 28);
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;
            default:
                return 31;
        }
    }

    /**
     * @param {YearMonth} nextYearMonth
     * @return {number} Number of years between this YearMonth and the nextYearMonth.
     */
    nbYearsUntil(nextYearMonth) {
        return nextYearMonth.year - this.year + (nextYearMonth.month - this.month) / 12;
    }

    /**
     * @param {number} day
     * @return {LocalDate}
     */
    atDay(day) {
        return new LocalDate({
            year: this.year,
            month: this.month,
            day: day
        });
    }

    /**
     * @return {YearMonth}
     */
    nextMonth() {
        return new YearMonth({
            year: this.month <= 11 ? this.year : this.year + 1,
            month: this.month <= 11 ? this.month + 1 : 1
        });
    }

    /**
     * @param {YearMonth} yearMonth
     * @return boolean
     */
    equals(yearMonth) {
        return this.year === yearMonth.year && this.month === yearMonth.month;
    }

    /**
     * @return {string}
     */
    toString() {
        return this.year + '-' + (this.month < 10 ? '0' : '') + this.month;
    }

    /**
     * @param {YearMonth} startIncl
     * @param {YearMonth} endIncl
     * @return {YearMonth[]}
     */
    static generateRangeBetween(startIncl, endIncl) {
        /** @type {YearMonth[]} */
        const yearMonths = [];

        for (let year = startIncl.year; year <= endIncl.year; year++) {
            const startMonth = year === startIncl.year ? startIncl.month : 1;
            const endMonth = year === endIncl.year ? endIncl.month : 12;
            for (let month = startMonth; month <= endMonth; month++) {
                yearMonths.push(new YearMonth({
                    year: year,
                    month: month
                }));
            }
        }

        return yearMonths;
    }

    /**
     * @param {YearMonth} startIncl
     * @param {YearMonth} endIncl
     * @return {number}
     */
    static nbMonthsBetween(startIncl, endIncl) {
        return (endIncl.year - startIncl.year) * 12 + endIncl.month - startIncl.month;
    }

    /**
     * Useful for sorting an array of {@link YearMonth}s in the ascending order.
     *
     * @param {YearMonth} yearMonth1
     * @param {YearMonth} yearMonth2
     * @return {Number}
     */
    static compareAsc(yearMonth1, yearMonth2) {
        const yearDiff = yearMonth1.year - yearMonth2.year;
        if (yearDiff !== 0) {
            return yearDiff;
        }
        return yearMonth1.month - yearMonth2.month;
    }

    /**
     * Useful for sorting an array of {@link YearMonth}s in the descending order.
     *
     * @param {YearMonth} yearMonth1
     * @param {YearMonth} yearMonth2
     * @return {Number}
     */
    static compareDesc(yearMonth1, yearMonth2) {
        return YearMonth.compareAsc(yearMonth2, yearMonth1);
    }

    /**
     * @param {string} value
     * @return {{
     *     year: number,
     *     month: number
     * }}
     * @throws Error if the value is not parsable.
     */
    static _parseString(value) {
        if (value.trim().length === 0) {
            return {
                year: 0,
                month: 0
            };
        }

        const matched = value.match(/^(?<year>[0-9]{4})-(?<month>[0-9]{2})$/);
        if (!matched) {
            throw new Error(`The value '${value}' is not a valid YearMonth. The correct syntax is 'YYYY-MM'.`);
        }

        return {
            year: Number(matched.groups['year']),
            month: Number(matched.groups['month'])
        };
    }

    /**
     * @param {{
     *     year: number,
     *     month: number
     * }|string|null} properties
     * @return {{
     *     year: number,
     *     month: number
     * }}
     * @throws Error if the value is not parsable.
     */
    static _parseProperties(properties) {
        if (typeof properties === 'string') {
            return YearMonth._parseString(properties);
        }
        return {
            year: !properties ? 0 : properties.year || 0,
            month: !properties ? 0 : properties.month || 0
        };
    }
}

export {YearMonth}