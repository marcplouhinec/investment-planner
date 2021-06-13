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

            // Calculate the annualized performance for 2020
            let performance = historicalPriceAnalysisService.calculateAnnualPerformance(
                prices, new YearMonth('2020-01'), new YearMonth('2021-01'));
            assert.equal(performance, 0.19224284565945138);

            // Calculate the annualized performance for 2019
            performance = historicalPriceAnalysisService.calculateAnnualPerformance(
                prices, new YearMonth('2019-01'), new YearMonth('2020-01'));
            assert.equal(performance, 0.29071612450661855);

            // Calculate the annualized performance between 2019 and 2020 (2 years)
            performance = historicalPriceAnalysisService.calculateAnnualPerformance(
                prices, new YearMonth('2019-01'), new YearMonth('2021-01'));
            assert.equal(performance, 0.2405027469620169);

            // Calculate the annualized performance for 2 years until 2020-05-01
            performance = historicalPriceAnalysisService.calculateAnnualPerformance(
                prices, new YearMonth('2019-05'), new YearMonth('2021-05'));
            assert.equal(performance, 0.2029080283736311);
        });
    });
});
