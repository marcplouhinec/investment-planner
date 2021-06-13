import {historicalPriceAnalysisService} from '../../js/service/historicalPriceAnalysisService.js'
import {historicalPriceReadingService} from '../../js/service/historicalPriceParsingService.js'
import {Asset} from '../../js/model/Asset.js'
import {YearMonth} from '../../js/model/YearMonth.js'

const assert = chai.assert;
const expect = chai.expect;

describe('historicalPriceAnalysisService', () => {
    describe('#calculateAnnualPerformance()', () => {
        it('should calculate MSCI USA', async function () {
            // Load MSCI USA historical prices
            const asset = new Asset({
                code: "MSCI_USA_STANDARD",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI USA Standard (Large+Mid Cap).msci.xls"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the annualized performance between for 2020
            const performance = historicalPriceAnalysisService.calculateAnnualPerformance(
                prices, new YearMonth('2020-01'), new YearMonth('2021-01'));
            assert.equal(performance, 0.19224284565945138);
        });
    });
});
