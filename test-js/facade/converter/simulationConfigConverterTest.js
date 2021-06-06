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
        });

        it('should convert valid config', async function () {
            const response = await fetch('simulation-configs/default.json5');
            const code = await response.text();

            const simulationConfig = simulationConfigConverter.convertCodeToSimulationConfig(code);
            assert.equal(simulationConfig.scope.startYearMonth.year, 1970);
            assert.equal(simulationConfig.scope.startYearMonth.month, 1);
            assert.equal(simulationConfig.scope.endYearMonth.year, 2065);
            assert.equal(simulationConfig.scope.endYearMonth.month, 1);
        });

        it('should fail with invalid config', () => {
            expect(() => {
                simulationConfigConverter.convertCodeToSimulationConfig('@#!');
            }).to.throw("JSON5: invalid character '@' at 1:1");
        });
    });
});
