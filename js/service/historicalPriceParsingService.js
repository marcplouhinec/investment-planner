import {Asset} from '../model/Asset.js';
import {HistoricalPrice} from '../model/HistoricalPrice.js';

const historicalPriceReadingService = {

    /**
     * @async
     * @param {Asset} asset
     * @return {Promise<HistoricalPrice[]>}
     */
    readHistoricalPrices: async function (asset) {
        switch (asset.historicalPricesFormat) {
            case 'YAHOO_FINANCE_MONTHLY':
                return await this._readYahooFinanceMonthlyHistoricalPrices(asset.historicalPricesPath);
            default:
                throw new Error('Unsupported historicalPricesFormat: ' + asset.historicalPricesFormat);
        }
    },

    /**
     * @async
     * @param {string} historicalPricesPath
     * @return {Promise<HistoricalPrice[]>}.
     */
    _readYahooFinanceMonthlyHistoricalPrices: async function (historicalPricesPath) {
        const historicalPricesFetchResponse = await fetch(historicalPricesPath);
        const historicalPricesCsv = await historicalPricesFetchResponse.text();

        /** @type {HistoricalPrice[]} */
        const historicalPrices = [];

        const rows = historicalPricesCsv.split('\n');
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',');
            historicalPrices.push(new HistoricalPrice({
                date: values[0],
                priceInUsd: Number(values[1])
            }));
        }

        return historicalPrices;
    }

};

export {historicalPriceReadingService};