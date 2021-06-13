import {Year} from './Year.js';

class LocalDate {

    /**
     * @param {{
     *     year: number,
     *     month: number,
     *     day: number
     * }|string|null} properties
     * @throws Error if the value is not parsable.
     */
    constructor(properties) {
        const sanitizedProperties = LocalDate._parseProperties(properties);

        /** @type {number} */
        this.year = sanitizedProperties.year;

        /** @type {number} */
        this.month = sanitizedProperties.month;

        /** @type {number} */
        this.day = sanitizedProperties.day;
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
     * @return {{
     *     year: number,
     *     month: number,
     *     day: number
     * }}
     * @throws Error if the value is not parsable.
     */
    static _parseString(value) {
        if (value.trim().length === 0) {
            return {
                year: 0,
                month: 0,
                day: 0
            };
        }

        const matched = value.match(/^(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})$/);
        if (!matched) {
            throw new Error(`The value '${value}' is not a valid LocalDate. The correct syntax is 'YYYY-MM-DD'.`);
        }

        return {
            year: Number(matched.groups['year']),
            month: Number(matched.groups['month']),
            day: Number(matched.groups['day'])
        };
    }

    /**
     * @param {{
     *     year: number,
     *     month: number,
     *     day: number
     * }|string|null} properties
     * @return {{
     *     year: number,
     *     month: number,
     *     day: number
     * }}
     * @throws Error if the value is not parsable.
     */
    static _parseProperties(properties) {
        if (typeof properties === 'string') {
            return LocalDate._parseString(properties);
        }
        return {
            year: !properties ? 0 : properties.year || 0,
            month: !properties ? 0 : properties.month || 0,
            day: !properties ? 0 : properties.day || 0
        };
    }

}

export {LocalDate};