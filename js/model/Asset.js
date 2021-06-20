class Asset {

    /**
     * @param {string} code
     * @param {string} historicalPricesFormat
     * @param {string} historicalPricesPath
     */
    constructor(code, historicalPricesFormat, historicalPricesPath) {
        /** @type {string} */
        this.code = code;
        /** @type {string} */
        this.historicalPricesFormat = historicalPricesFormat;
        /** @type {string} */
        this.historicalPricesPath = historicalPricesPath;
    }

    /**
     * @param {{
     *     code: string,
     *     historicalPricesFormat: string,
     *     historicalPricesPath: string,
     * }=} properties
     * @return {Asset}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        const code = sanitizedProperties.code || '';
        const historicalPricesFormat = sanitizedProperties.historicalPricesFormat || '';
        const historicalPricesPath = sanitizedProperties.historicalPricesPath || '';

        return new Asset(code, historicalPricesFormat, historicalPricesPath);
    }
}

export {Asset};