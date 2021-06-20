import {YearMonth} from "./YearMonth.js";

class Scope {

    /**
     * @param {YearMonth} startYearMonth
     * @param {YearMonth} endYearMonth
     */
    constructor(startYearMonth, endYearMonth) {
        /** @type {YearMonth} */
        this.startYearMonth = startYearMonth;
        /** @type {YearMonth} */
        this.endYearMonth = endYearMonth;
    }

    /**
     * @param {{
     *     startYearMonth: YearMonth,
     *     endYearMonth: YearMonth
     * }|null} properties
     * @return {Scope}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        const startYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.startYearMonth);
        const endYearMonth = YearMonth.parseStringOrProperties(sanitizedProperties.endYearMonth);

        return new Scope(startYearMonth, endYearMonth);
    }
}

export {Scope};