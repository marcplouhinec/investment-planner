import {SimulationConfig} from '../model/SimulationConfig.js'

const simulationConfigService = {

    /**
     * @type {function(SimulationConfig)[]}
     */
    _configUpdatedListeners: [],

    /**
     * @param {SimulationConfig} simulationConfig
     */
    updateSimulation: function (simulationConfig) {
        this._configUpdatedListeners.forEach(it => it(simulationConfig));
    },

    /**
     * @param {function(SimulationConfig)} listener
     */
    registerConfigUpdatedListener: function (listener) {
        this._configUpdatedListeners.push(listener);
    }

};

export {simulationConfigService};