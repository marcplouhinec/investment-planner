import {LocalDate} from './LocalDate.js';

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
}

export {HistoricalPrice};