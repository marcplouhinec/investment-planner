import {Simulation} from '../../js/model/Simulation.js'
import {YearMonth} from '../../js/model/YearMonth.js'
import {SimulationConfig} from "../../js/model/SimulationConfig.js";
import JSON5 from "../../vendors/json5-2.2.0/dist/index.mjs";

const assert = chai.assert;
const expect = chai.expect;

describe('Simulation', () => {
    describe('#savedAmountInUsdPerYearMonth', () => {
        it('should work with default config', async function () {
            const response = await fetch('simulation-configs/default.json5');
            const code = await response.text();
            const simulationConfig = SimulationConfig.parseProperties(JSON5.parse(code));

            const simulation = new Simulation();
            await simulation.update(simulationConfig);

            assert.equal(simulation.savedAmountInUsdPerYearMonth.size, simulation.portfolioYearMonths.length);

            let yearMonth = simulation.portfolioYearMonths[0];
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 3000);
            yearMonth = yearMonth.nextMonth();
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 0);
            yearMonth = yearMonth.nextMonth();
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 0);
            yearMonth = yearMonth.nextMonth();
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 3000);
            yearMonth = yearMonth.nextMonth();
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 0);

            yearMonth = YearMonth.parseString('2050-01')
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 0);
            yearMonth = yearMonth.nextMonth();
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 0);
            yearMonth = yearMonth.nextMonth();
            assert.equal(simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()), 0);
        });
    });

    describe('#retirementPensionInUsdPerYearMonth', () => {
        it('should work with default config', async function () {
            const response = await fetch('simulation-configs/default.json5');
            const code = await response.text();
            const simulationConfig = SimulationConfig.parseProperties(JSON5.parse(code));

            const simulation = new Simulation();
            await simulation.update(simulationConfig);

            assert.equal(simulation.retirementPensionInUsdPerYearMonth.size, simulation.retirementYearMonths.length);

            assert.equal(simulation.retirementYearMonths[0].toString(), '2050-01');
            assert.equal(simulation.retirementYearMonths[simulation.retirementYearMonths.length - 1].toString(), '2065-01');

            let yearMonth = simulation.retirementYearMonths[0];
            assert.equal(simulation.retirementPensionInUsdPerYearMonth.get(yearMonth.toString()), 5000);
            yearMonth = yearMonth.nextMonth();
            assert.equal(simulation.retirementPensionInUsdPerYearMonth.get(yearMonth.toString()), 5012.331348861519);
        });
    });
});
