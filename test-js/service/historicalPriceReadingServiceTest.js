import {historicalPriceReadingService} from '../../js/service/historicalPriceReadingService.js'
import {Asset} from '../../js/model/Asset.js'

const assert = chai.assert;
const expect = chai.expect;

describe('historicalPriceReadingService', () => {
    describe('#readHistoricalPrices()', () => {
        it('should convert Yahoo Finance Monthly format', async function () {
            const asset = Asset.parseProperties({
                code: "TOTAL_STOCK_MARKET",
                historicalPricesFormat: "YAHOO_FINANCE_MONTHLY",
                historicalPricesPath: "investment-assets/Vanguard Total Stock Market Index Fund ETF Shares - VTI.yf.csv"
            });

            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);
            assert.equal(prices.length, 241);
            assert.equal(prices[0].date.toString(), '2001-07-01');
            assert.equal(prices[0].priceInUsd, 56.299999);
            assert.equal(prices[240].date.toString(), '2021-06-11');
            assert.equal(prices[240].priceInUsd, 220.779999);
        });

        it('should convert MSCI Monthly format', async function () {
            const asset = Asset.parseProperties({
                code: "MSCI_ACWI_EX_USA",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI ACWI ex USA Standard (Large+Mid Cap).msci.xls"
            });

            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);
            assert.equal(prices.length, 401);
            assert.equal(prices[0].date.toString(), '1987-12-31');
            assert.equal(prices[0].priceInUsd, 100.000);
            assert.equal(prices[400].date.toString(), '2021-04-30');
            assert.equal(prices[400].priceInUsd, 345.205);
        });

        it('should fail with unknown format', async function () {
            const asset = Asset.parseProperties({
                code: "TOTAL_STOCK_MARKET",
                historicalPricesFormat: "UNKNOWN_FORMAT",
                historicalPricesPath: "test.csv"
            });

            /** @type {?Error} */
            let expectedError = null;
            try {
                await historicalPriceReadingService.readHistoricalPrices(asset);
            } catch (e) {
                expectedError = e;
            }
            assert.equal(expectedError.message, "Unsupported historicalPricesFormat: UNKNOWN_FORMAT");
        });
    });
});
