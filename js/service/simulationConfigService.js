import {SimulationConfig} from '../model/SimulationConfig.js'
import {Simulation} from '../model/Simulation.js'

const simulationConfigService = {
    /** @type {SimulationConfig} */
    _unprocessedSimulationConfig: null,
    /** @type {Simulation} */
    _simulation: new Simulation(),
    /** @type {function(Simulation)[]} */
    _configUpdatedListeners: [],

    init: function () {
        setInterval(() => {
            this._updateSimulation();
        }, 5000);
    },

    /**
     * @param {SimulationConfig} simulationConfig
     */
    onSimulationConfigUpdated: function (simulationConfig) {
        this._unprocessedSimulationConfig = simulationConfig;

        // Update the simulation immediately if it is blank
        if (!this._simulation.lastUpdatedDate) {
            this._updateSimulation();
        }
    },

    _updateSimulation: function () {
        if (!this._unprocessedSimulationConfig) {
            return;
        }
        const simulationConfig = this._unprocessedSimulationConfig;
        this._unprocessedSimulationConfig = null;

        this._simulation.update(simulationConfig)
            .then(() => {
                this._configUpdatedListeners.forEach(it => it(this._simulation));
            });
    },

    /**
     * @param {function(Simulation)} listener
     */
    registerConfigUpdatedListener: function (listener) {
        this._configUpdatedListeners.push(listener);
    }

};

export {simulationConfigService};