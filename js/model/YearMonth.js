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