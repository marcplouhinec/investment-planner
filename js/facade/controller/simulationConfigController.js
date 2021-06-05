import CodeFlask from '../../../vendors/codeflask-1.4.1/build/codeflask.module.js';

const simulationConfigController = {

    init: function () {
        // Initialize the code editor
        const flask = new CodeFlask('#sim-config', {
            language: 'js'
        });
        fetch('simulation-configs/default.json5')
            .then(response => response.text())
            .then(content => flask.updateCode(content));
    },

};

export {simulationConfigController};