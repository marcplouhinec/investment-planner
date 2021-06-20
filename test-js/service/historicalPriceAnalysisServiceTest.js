import {historicalPriceAnalysisService} from '../../js/service/historicalPriceAnalysisService.js'
import {historicalPriceReadingService} from '../../js/service/historicalPriceReadingService.js'
import {Asset} from '../../js/model/Asset.js'
import {YearMonth} from '../../js/model/YearMonth.js'
import {LocalDate} from "../../js/model/LocalDate.js";
import {RegressionResult} from "../../js/model/RegressionResult.js";

const assert = chai.assert;
const expect = chai.expect;

describe('historicalPriceAnalysisService', () => {
    describe('#calculateAnnualizedPerformance()', () => {
        it('should calculate MSCI USA', async function () {
            // Load MSCI USA historical prices
            const asset = Asset.parseProperties({
                code: "MSCI_USA_STANDARD",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI USA Standard (Large+Mid Cap).msci.xls"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the annualized performance for 2020
            let performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2020-01'), YearMonth.parseString('2021-01'));
            assert.equal(performance, 0.19224284565945138);

            // Calculate the annualized performance for 2019
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2019-01'), YearMonth.parseString('2020-01'));
            assert.equal(performance, 0.29071612450661855);

            // Calculate the annualized performance between 2019 and 2020 (2 years)
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2019-01'), YearMonth.parseString('2021-01'));
            assert.equal(performance, 0.2405027469620169);

            // Calculate the annualized performance for 2 years until 2020-05-01
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2019-05'), YearMonth.parseString('2021-05'));
            assert.equal(performance, 0.2029080283736311);
        });

        it('should calculate MSCI USA gross', async function () {
            // Load MSCI USA gross historical prices
            const asset = Asset.parseProperties({
                code: "MSCI_USA_STANDARD_GROSS",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI USA Standard (Large+Mid Cap) - gross.msci.xls"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the annualized performance for 1 year since the 1st May
            let performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2020-05'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.4847);

            // Calculate the annualized performance for 3 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2018-05'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.1937);

            // Calculate the annualized performance for 5 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2016-05'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.1788);

            // Calculate the annualized performance for 10 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('2011-05'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.1433);

            // Calculate the annualized performance from inception to the 1st May 2021
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformance(
                prices, YearMonth.parseString('1988-01'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.1141);
        });
    });

    describe('#calculateAnnualizedPerformanceStandardDeviation()', () => {
        it('should calculate MSCI USA gross', async function () {
            // Load MSCI USA gross historical prices
            const asset = Asset.parseProperties({
                code: "MSCI_USA_STANDARD_GROSS",
                historicalPricesFormat: "MSCI_MONTHLY",
                historicalPricesPath: "investment-assets/MSCI USA Standard (Large+Mid Cap) - gross.msci.xls"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the annualized performance for 3 years since the 1st May
            let performance = historicalPriceAnalysisService.calculateAnnualizedPerformanceStandardDeviation(
                prices, YearMonth.parseString('2018-05'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.1887);

            // Calculate the annualized performance for 5 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformanceStandardDeviation(
                prices, YearMonth.parseString('2016-05'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.1524);

            // Calculate the annualized performance for 10 years since the 1st May
            performance = historicalPriceAnalysisService.calculateAnnualizedPerformanceStandardDeviation(
                prices, YearMonth.parseString('2011-05'), YearMonth.parseString('2021-05')).toFixed(4);
            assert.equal(performance, 0.1382);
        });
    });

    describe('#calculateRegression()', () => {
        it('should calculate regression with TOTAL_STOCK_MARKET', async function () {
            // Load the historical prices
            const asset = Asset.parseProperties({
                code: "TOTAL_STOCK_MARKET",
                historicalPricesFormat: "YAHOO_FINANCE_MONTHLY",
                historicalPricesPath: "investment-assets/Vanguard Total Stock Market Index Fund ETF Shares - VTI.yf.csv"
            });
            const prices = await historicalPriceReadingService.readHistoricalPrices(asset);

            // Calculate the regression
            const result = historicalPriceAnalysisService.calculateRegression(
                prices, YearMonth.parseString('1970-01'), YearMonth.parseString('2022-01'));

            assert.equal(result.startDate.toString(), '2001-07-01');
            assert.equal(result.endDate.toString(), '2021-06-01');
            assert.equal(result.startPriceInUsd, 40.41634212096807);
            assert.equal(result.monthlyPerformance, 0.005678686934672772);
            assert.equal(result.standardError, 14.426626257267296);
        });
    });

    describe('#generateMonthlyPredictions()', () => {
        it('should generate for few months', () => {
            const result = new RegressionResult(
                LocalDate.parseString('2001-01-01'),
                LocalDate.parseString('2010-01-01'),
                100,
                0.006,
                10);
            const estimations = historicalPriceAnalysisService.generateMonthlyPredictions(
                result, YearMonth.parseString('2001-04'));

            assert.equal(estimations.length, 4);
            assert.equal(estimations[0].yearMonth.toString(), '2001-01');
            assert.equal(estimations[1].yearMonth.toString(), '2001-02');
            assert.equal(estimations[2].yearMonth.toString(), '2001-03');
            assert.equal(estimations[3].yearMonth.toString(), '2001-04');
            assert.equal(estimations[0].avgPriceInUsd, 100);
            assert.equal(estimations[1].avgPriceInUsd, 100.6);
            assert.equal(estimations[2].avgPriceInUsd, 101.2036);
            assert.equal(estimations[3].avgPriceInUsd, 101.8108216);
            assert.equal(estimations[0].lower95PriceInUsd, 100 - 2 * 10);
            assert.equal(estimations[1].lower95PriceInUsd, 100.6 - 2 * 10);
            assert.equal(estimations[2].lower95PriceInUsd, 101.2036 - 2 * 10);
            assert.equal(estimations[3].lower95PriceInUsd, 101.8108216 - 2 * 10);
            assert.equal(estimations[0].upper95PriceInUsd, 100 + 2 * 10);
            assert.equal(estimations[1].upper95PriceInUsd, 100.6 + 2 * 10);
            assert.equal(estimations[2].upper95PriceInUsd, 101.2036 + 2 * 10);
            assert.equal(estimations[3].upper95PriceInUsd, 101.8108216 + 2 * 10);
        });
    });
});
