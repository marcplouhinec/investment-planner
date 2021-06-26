import {SimulationConfig} from '../../js/model/SimulationConfig.js'
import JSON5 from '../../vendors/json5-2.2.0/dist/index.mjs';

const assert = chai.assert;

describe('simulationConfig', () => {
    describe('#parseProperties()', () => {
        it('should convert empty config', () => {
            const simulationConfig = SimulationConfig.parseProperties({});
            assert.equal(simulationConfig.scope.startYearMonth.year, 0);
            assert.equal(simulationConfig.scope.startYearMonth.month, 0);
            assert.equal(simulationConfig.scope.endYearMonth.year, 0);
            assert.equal(simulationConfig.scope.endYearMonth.month, 0);

            assert.equal(simulationConfig.portfolioInvestments.length, 0);

            assert.equal(simulationConfig.assets.length, 0);
        });

        it('should convert valid config', async function () {
            const response = await fetch('simulation-configs/default.json5');
            const code = await response.text();

            const simulationConfig = SimulationConfig.parseProperties(JSON5.parse(code));
            assert.equal(simulationConfig.scope.startYearMonth.year, 1970);
            assert.equal(simulationConfig.scope.startYearMonth.month, 1);
            assert.equal(simulationConfig.scope.endYearMonth.year, 2065);
            assert.equal(simulationConfig.scope.endYearMonth.month, 1);

            assert.equal(simulationConfig.portfolioInvestments.length, 5);

            const portfolioInvestment = simulationConfig.portfolioInvestments[0];
            assert.equal(portfolioInvestment.assetCode, "TOTAL_STOCK_MARKET");
            assert.equal(portfolioInvestment.phase1StartYearMonth.year, 2021);
            assert.equal(portfolioInvestment.phase1StartYearMonth.month, 7);
            assert.equal(portfolioInvestment.phase1InitialWeight, 55);
            assert.equal(portfolioInvestment.phase1FinalWeight, 55);
            assert.equal(portfolioInvestment.phase2StartYearMonth.year, 2025);
            assert.equal(portfolioInvestment.phase2StartYearMonth.month, 1);
            assert.equal(portfolioInvestment.phase2FinalWeight, 20);
            assert.equal(portfolioInvestment.phase3StartYearMonth.year, 2045);
            assert.equal(portfolioInvestment.phase3StartYearMonth.month, 1);
            assert.equal(portfolioInvestment.phase3FinalWeight, 12);
            assert.equal(portfolioInvestment.phase3EndYearMonth.year, 2065);
            assert.equal(portfolioInvestment.phase3EndYearMonth.month, 1);
            assert.equal(portfolioInvestment.enabled, true);

            assert.equal(simulationConfig.savings.length, 2);
            const saving = simulationConfig.savings[0];
            assert.equal(saving.startYearMonth.toString(), "2021-07");
            assert.equal(saving.periodInMonths, 3);
            assert.equal(saving.amountInUsd, 3000);

            assert.equal(simulationConfig.assets.length, 5);
            const asset = simulationConfig.assets[0];
            assert.equal(asset.code, "TOTAL_STOCK_MARKET");
            assert.equal(asset.historicalPricesFormat, "YAHOO_FINANCE_MONTHLY");
            assert.equal(asset.historicalPricesPath,
                "investment-assets/Vanguard Total Stock Market Index Fund ETF Shares - VTI.yf.csv");
        });
    });
});
