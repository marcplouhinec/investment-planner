import CodeFlask from '../../../vendors/codeflask-1.4.1/build/codeflask.module.js';
import {simulationConfigService} from '../../service/simulationConfigService.js'
import {simulationConfigConverter} from '../converter/simulationConfigConverter.js'

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
        flask.onUpdate((code) => {
            this._onCodeUpdated(code);
        });
    },

    _onCodeUpdated: function (code) {
        if (!code) {
            return;
        }

        let simulationConfig;
        try {
            simulationConfig = simulationConfigConverter.convertCodeToSimulationConfig(code);
        } catch (error) {
            this._updateMessage(String(error), 'ERROR');
            console.log(error);
        }

        if (simulationConfig) {
            simulationConfigService.updateSimulation(simulationConfig);
            this._updateMessage('Simulation updated (' + new Date().toISOString() + ')', 'INFO');
        }
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