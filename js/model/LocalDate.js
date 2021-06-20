import {Year} from './Year.js';
import {YearMonth} from "./YearMonth.js";

class LocalDate {

    /**
     * @param {number} year
     * @param {number} month
     * @param {number} day
     */
    constructor(year, month, day) {
        /** @type {number} */
        this.year = year;
        /** @type {number} */
        this.month = month;
        /** @type {number} */
        this.day = day;
    }

    /**
     * @param {LocalDate} nextLocalDate
     * @return {number} Number of days between this date and the nextLocalDate.
     */
    nbDaysUntil(nextLocalDate) {
        const nextDate = new Date(nextLocalDate.year, nextLocalDate.month - 1, nextLocalDate.day);
        const thisDate = new Date(this.year, this.month - 1, this.day);
        return Math.round((nextDate - thisDate) / (1000 * 60 * 60 * 24));
    }

    /**
     * @param {LocalDate} nextLocalDate
     * @return {number} Number of years between this date and the nextLocalDate.
     */
    nbYearsUntil(nextLocalDate) {
        const startYear = Math.min(this.year, nextLocalDate.year);
        const endYear = Math.max(this.year, nextLocalDate.year);

        let nbRemainingDays = this.nbDaysUntil(nextLocalDate);
        const sign = Math.sign(nbRemainingDays);
        nbRemainingDays = Math.abs(nbRemainingDays);

        let nbYears = 0;
        let nbDaysPerYear = Year.isLeapYear(startYear) ? 366 : 365;

        for (let y = startYear; y < endYear; y++) {
            nbDaysPerYear = (Year.isLeapYear(y) ? 366 : 365);
            nbRemainingDays = nbRemainingDays - nbDaysPerYear;
            nbYears++;
        }

        return sign * (nbYears + nbRemainingDays / nbDaysPerYear);
    }

    /**
     * @param {LocalDate} localDate
     * @return boolean
     */
    isBefore(localDate) {
        return this.year < localDate.year
            || (this.year === localDate.year && this.month < localDate.month)
            || (this.year === localDate.year && this.month === localDate.month && this.day < localDate.day);
    }

    /**
     * @param {LocalDate} localDate
     * @return boolean
     */
    isAfter(localDate) {
        return localDate.isBefore(this);
    }

    /**
     * @param {LocalDate} localDate
     * @return boolean
     */
    equals(localDate) {
        return this.year === localDate.year && this.month === localDate.month && this.day === localDate.day;
    }

    /**
     * @return {string}
     */
    toString() {
        return this.year
            + '-' + (this.month < 10 ? '0' : '') + this.month
            + '-' + (this.day < 10 ? '0' : '') + this.day;
    }

    /**
     * @return {YearMonth}
     */
    toYearMonth() {
        return new YearMonth(this.year, this.month);
    }

    /**
     * @return {YearMonth}
     */
    toClosestYearMonth() {
        let year = this.year;
        let month = this.day < 15 ? this.month : this.month + 1;
        if (month === 13) {
            month = 1;
            year++;
        }

        return new YearMonth(year, month);
    }

    /**
     * Useful for sorting an array of {@link LocalDate}s in the ascending order.
     *
     * @param {LocalDate} localDate1
     * @param {LocalDate} localDate2
     * @return {Number}
     */
    static compareAsc(localDate1, localDate2) {
        const yearDiff = localDate1.year - localDate2.year;
        if (yearDiff !== 0) {
            return yearDiff;
        }
        const monthDiff = localDate1.month - localDate2.month;
        if (monthDiff !== 0) {
            return monthDiff;
        }
        return localDate1.day - localDate2.day;
    }

    /**
     * @param {LocalDate[]} availableLocalDates
     * @param {LocalDate} targetLocalDate
     * @return {LocalDate} from availableLocalDates that is the closest to targetLocalDate.
     */
    static findClosestAvailableLocalDate(availableLocalDates, targetLocalDate) {
        let closestAvailableLocalDate = null;
        let minNbDays = 0;

        for (let availableLocalDate of availableLocalDates) {
            const nbDays = Math.abs(availableLocalDate.nbDaysUntil(targetLocalDate));

            if (!closestAvailableLocalDate || minNbDays > nbDays) {
                closestAvailableLocalDate = availableLocalDate;
                minNbDays = nbDays;
            }
        }

        return closestAvailableLocalDate;
    }

    /**
     * @param {string} value
     * @return {LocalDate}
     */
    static parseString(value) {
        if (value.trim().length === 0) {
            return new LocalDate(0, 0, 0);
        }

        const matched = value.match(/^(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})$/);
        if (!matched) {
            throw new Error(`The value '${value}' is not a valid LocalDate. The correct syntax is 'YYYY-MM-DD'.`);
        }

        const year = Number(matched.groups['year']);
        const month = Number(matched.groups['month']);
        const day = Number(matched.groups['day']);

        return new LocalDate(year, month, day);
    }

    /**
     * @param {{
     *     year: number,
     *     month: number,
     *     day: number
     * }|null} properties
     * @return {LocalDate}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        const year = !sanitizedProperties ? 0 : sanitizedProperties.year || 0;
        const month = !sanitizedProperties ? 0 : sanitizedProperties.month || 0;
        const day = !sanitizedProperties ? 0 : sanitizedProperties.day || 0;

        return new LocalDate(year, month, day);
    }

    /**
     * @param {{
     *     year: number,
     *     month: number,
     *     day: number
     * }|string|null} stringOrProperties
     * @return {LocalDate}
     */
    static parseStringOrProperties(stringOrProperties) {
        if (typeof stringOrProperties === 'string') {
            return LocalDate.parseString(stringOrProperties);
        } else {
            return LocalDate.parseProperties(stringOrProperties);
        }
    }
}

export {LocalDate};