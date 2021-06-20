import {SimulationConfig} from '../model/SimulationConfig.js'
import {Simulation} from '../model/Simulation.js'

const simulationConfigService = {
    /** @type {Simulation} */
    _simulation: new Simulation(),
    /** @type {function(Simulation)[]} */
    _configUpdatedListeners: [],

    /**
     * @param {SimulationConfig} simulationConfig
     */
    updateSimulation: function (simulationConfig) {
        this._simulation.update(simulationConfig);
        this._configUpdatedListeners.forEach(it => it(this._simulation));
    },

    /**
     * @param {function(Simulation)} listener
     */
    registerConfigUpdatedListener: function (listener) {
        this._configUpdatedListeners.push(listener);
    }

};

export {simulationConfigService};