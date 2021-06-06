import JSON5 from '../../../vendors/json5-2.2.0/dist/index.mjs';
import {SimulationConfig} from '../../model/SimulationConfig.js';

const simulationConfigConverter = {

    /**
     * @param {string} code JSON5 representation of the {@link SimulationConfig}.
     * @return {SimulationConfig}
     * @throws Conversion error
     */
    convertCodeToSimulationConfig: function (code) {
        const parsedCode = JSON5.parse(code);
        return new SimulationConfig(parsedCode);
    }

};

export {simulationConfigConverter};