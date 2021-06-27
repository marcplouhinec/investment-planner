import CodeFlask from '../../../vendors/codeflask-1.4.1/build/codeflask.module.js';
import {simulationConfigService} from '../../service/simulationConfigService.js'
import {SimulationConfig} from '../../model/SimulationConfig.js';
import JSON5 from "../../../vendors/json5-2.2.0/dist/index.mjs";

const simulationConfigController = {

    init: function () {
        // Initialize the code editor
        const flask = new CodeFlask('#sim-config', {
            language: 'js',
            lineNumbers: true
        });
        fetch('simulation-configs/default.json5')
            .then(response => response.text())
            .then(content => flask.updateCode(content));

        // Handle code update events
        flask.onUpdate(code => {
            this._onCodeUpdated(code);
        });
        simulationConfigService.registerConfigUpdatedListener(() => {
            this._onSimulationUpdated();
        });
    },

    _onCodeUpdated: function (code) {
        if (!code) {
            return;
        }

        let simulationConfig;
        try {
            simulationConfig = SimulationConfig.parseProperties(JSON5.parse(code));
        } catch (error) {
            this._updateMessage(String(error), 'ERROR');
            console.log(error);
        }

        if (simulationConfig) {
            simulationConfigService.onSimulationConfigUpdated(simulationConfig);
        }
    },

    _onSimulationUpdated: function () {
        this._updateMessage('Simulation updated at ' + new Date().toISOString(), 'INFO');
    },

    /**
     * @param {string} message
     * @param {('INFO'|'ERROR')} level
     */
    _updateMessage: function (message, level) {
        const element = document.getElementById('sim-config-message');
        element.textContent = message;
        element.className = level === 'ERROR' ? 'sim-config-message-error' : 'sim-config-message-info';
    }
};

export {simulationConfigController};