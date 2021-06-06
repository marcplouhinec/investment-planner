import {YearMonth} from "./YearMonth.js";

class Scope {

    /**
     * @param {{
     *     startYearMonth: YearMonth,
     *     endYearMonth: YearMonth,
     *     portfolioInvestmentStartYearMonth: YearMonth,
     * }=} properties
     */
    constructor(properties) {
        const sanitizedProperties = properties || {};

        /** @type {YearMonth} */
        this.startYearMonth = new YearMonth(sanitizedProperties.startYearMonth);
        /** @type {YearMonth} */
        this.endYearMonth = new YearMonth(sanitizedProperties.endYearMonth);
    }

}

export {Scope};