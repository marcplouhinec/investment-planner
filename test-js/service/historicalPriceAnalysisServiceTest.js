import {historicalPriceAnalysisService} from '../../js/service/historicalPriceAnalysisService.js'
import {historicalPriceReadingService} from '../../js/service/historicalPriceParsingService.js'
import {Asset} from '../../js/model/Asset.js'
import {YearMonth} from '../../js/model/YearMonth.js'

const assert = chai.assert;
const expect = chai.expect;

describe('historicalPriceAnalysisService', () => {
    describe('#calculateAnnualizedPerformance()', () => {
        it('should calculate MSCI USA', async function () {
            // Load MSCI USA historical prices
            const asset = new Asset({
                code: "MSCI_USA_STANDARD",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI USA Standard (Large+Mid Cap).msci.xls"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the annualized performance for 2020
            let performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2020-01'), new YearMonth('2021-01'));
            assert.equal(performance, 0.19224284565945138);

            // Calculate the annualized performance for 2019
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2019-01'), new YearMonth('2020-01'));
            assert.equal(performance, 0.29071612450661855);

            // Calculate the annualized performance between 2019 and 2020 (2 years)
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2019-01'), new YearMonth('2021-01'));
            assert.equal(performance, 0.2405027469620169);

            // Calculate the annualized performance for 2 years until 2020-05-01
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2019-05'), new YearMonth('2021-05'));
            assert.equal(performance, 0.2029080283736311);
        });

        it('should calculate MSCI USA gross', async function () {
            // Load MSCI USA gross historical prices
            const asset = new Asset({
                code: "MSCI_USA_STANDARD_GROSS",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI USA Standard (Large+Mid Cap) - gross.msci.xls"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the annualized performance for 1 year since the 1st May
            let performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2020-05'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.4847);

            // Calculate the annualized performance for 3 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2018-05'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.1937);

            // Calculate the annualized performance for 5 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2016-05'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.1788);

            // Calculate the annualized performance for 10 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('2011-05'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.1433);

            // Calculate the annualized performance from inception to the 1st May 2021
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, new YearMonth('1988-01'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.1141);
        });
    });

    describe('#calculateAnnualizedPerformanceStandardDeviation()', () => {
        it('should calculate MSCI USA gross', async function () {
            // Load MSCI USA gross historical prices
            const asset = new Asset({
                code: "MSCI_USA_STANDARD_GROSS",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI USA Standard (Large+Mid Cap) - gross.msci.xls"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the annualized performance for 3 years since the 1st May
            let performance = historicalPriceAnalysisService.calculateAnnualizedPerformanceStandardDeviation(
                prices, new YearMonth('2018-05'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.1887);

            // Calculate the annualized performance for 5 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformanceStandardDeviation(
                prices, new YearMonth('2016-05'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.1524);

            // Calculate the annualized performance for 10 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformanceStandardDeviation(
                prices, new YearMonth('2011-05'), new YearMonth('2021-05')).toFixed(4);
            assert.equal(performance, 0.1382);
        });
    });
});
