class Asset {

    /**
     * @param {{
     *     code: string,
     *     historicalPricesFormat: string,
     *     historicalPricesPath: string,
     * }=} properties
     */
    constructor(properties) {
        const sanitizedProperties = properties || {};

        /** @type {string} */
        this.code = sanitizedProperties.code || '';

        /** @type {string} */
        this.historicalPricesFormat = sanitizedProperties.historicalPricesFormat || '';

        /** @type {string} */
        this.historicalPricesPath = sanitizedProperties.historicalPricesPath || '';
    }
}

export {Asset};