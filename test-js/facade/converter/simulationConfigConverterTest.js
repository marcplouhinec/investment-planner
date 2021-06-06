import {simulationConfigConverter} from '../../../js/facade/converter/simulationConfigConverter.js'

const assert = chai.assert;
const expect = chai.expect;

describe('simulationConfigConverter', () => {
    describe('#convertCodeToSimulationConfig()', () => {
        it('should convert empty config', () => {
            const simulationConfig = simulationConfigConverter.convertCodeToSimulationConfig('{}');
            assert.equal(simulationConfig.scope.startYearMonth.year, 0);
            assert.equal(simulationConfig.scope.startYearMonth.month, 0);
            assert.equal(simulationConfig.scope.endYearMonth.year, 0);
            assert.equal(simulationConfig.scope.endYearMonth.month, 0);

            assert.equal(simulationConfig.portfolioInvestments.length, 0);
        });

        it('should convert valid config', async function () {
            const response = await fetch('simulation-configs/default.json5');
            const code = await response.text();

            const simulationConfig = simulationConfigConverter.convertCodeToSimulationConfig(code);
            assert.equal(simulationConfig.scope.startYearMonth.year, 1970);
            assert.equal(simulationConfig.scope.startYearMonth.month, 1);
            assert.equal(simulationConfig.scope.endYearMonth.year, 2065);
            assert.equal(simulationConfig.scope.endYearMonth.month, 1);

            assert.equal(simulationConfig.portfolioInvestments.length, 1);

            const portfolioInvestment = simulationConfig.portfolioInvestments[0];
            assert.equal(portfolioInvestment.assetCode, "FUND_001");
            assert.equal(portfolioInvestment.phase1StartYearMonth.year, 2021);
            assert.equal(portfolioInvestment.phase1StartYearMonth.month, 7);
            assert.equal(portfolioInvestment.phase1InitialWeight, 60);
            assert.equal(portfolioInvestment.phase1FinalWeight, 55);
            assert.equal(portfolioInvestment.phase2StartYearMonth.year, 2035);
            assert.equal(portfolioInvestment.phase2StartYearMonth.month, 1);
            assert.equal(portfolioInvestment.phase2FinalWeight, 20);
            assert.equal(portfolioInvestment.phase3StartYearMonth.year, 2050);
            assert.equal(portfolioInvestment.phase3StartYearMonth.month, 1);
            assert.equal(portfolioInvestment.phase3FinalWeight, 20);
            assert.equal(portfolioInvestment.phase3EndYearMonth.year, 2065);
            assert.equal(portfolioInvestment.phase3EndYearMonth.month, 1);
            assert.equal(portfolioInvestment.enabled, true);
        });

        it('should fail with invalid config', () => {
            expect(() => {
                simulationConfigConverter.convertCodeToSimulationConfig('@#!');
            }).to.throw("JSON5: invalid character '@' at 1:1");
        });
    });
});
