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
     * @return {string}
     */
    toString() {
        return this.year
            + '-' + (this.month < 10 ? '0' : '') + this.month
            + '-' + (this.day < 10 ? '0' : '') + this.day;
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