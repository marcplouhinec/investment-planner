import {Asset} from '../model/Asset.js';
import {HistoricalPrice} from '../model/HistoricalPrice.js';
import {LocalDate} from '../model/LocalDate.js';

const historicalPriceReadingService = {

    _MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    /**
     * @async
     * @param {Asset} asset
     * @return {Promise<HistoricalPrice[]>}
     */
    readHistoricalPrices: async function (asset) {
        switch (asset.historicalPricesFormat) {
            case 'YAHOO_FINANCE_MONTHLY':
                return await this._readYahooFinanceMonthlyHistoricalPrices(asset.historicalPricesPath);
            case 'MSCI_MONTHLY':
                return await this._readMsciMonthlyHistoricalPrices(asset.historicalPricesPath);
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
    },

    /**
     * @async
     * @param {string} historicalPricesPath
     * @return {Promise<HistoricalPrice[]>}.
     */
    _readMsciMonthlyHistoricalPrices: async function (historicalPricesPath) {
        const historicalPricesFetchResponse = await fetch(historicalPricesPath);
        const historicalPricesXls = await historicalPricesFetchResponse.arrayBuffer();

        /** @type {HistoricalPrice[]} */
        const historicalPrices = [];

        const workbook = XLS.read(historicalPricesXls, {type: 'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const range = XLS.utils.decode_range(sheet['!ref']);

        for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            const firstColNum = range.s.c;
            const firstCell = sheet[XLS.utils.encode_cell({r: rowNum, c: firstColNum})];
            const secondCell = sheet[XLS.utils.encode_cell({r: rowNum, c: firstColNum + 1})];
            if (!firstCell) {
                continue;
            }

            const rawDate = String(firstCell.w);
            const matched = rawDate.match(/^(?<month>[a-zA-Z]+) (?<day>[0-9]+), (?<year>[0-9]{4})$/);
            if (!matched) {
                continue;
            }

            const rawPrice = String(secondCell.w).replaceAll(',', '');
            historicalPrices.push(new HistoricalPrice({
                date: new LocalDate({
                    year: Number(matched.groups['year']),
                    month: this._MONTHS.indexOf(matched.groups['month']) + 1,
                    day: Number(matched.groups['day'])
                }),
                priceInUsd: Number(rawPrice)
            }));
        }

        return historicalPrices;
    }

};

export {historicalPriceReadingService};