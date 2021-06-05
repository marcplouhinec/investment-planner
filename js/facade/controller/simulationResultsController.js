import {Chart, registerables} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';

const simulationResultsController = {
    init: function () {
        // Initialize Chart.js
        Chart.register(...registerables);

        // Draw a sample chart
        const labels = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
        ];
        const data = {
            labels: labels,
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45],
            }]
        };
        const config = {
            type: 'line',
            data,
            options: {}
        };
        var myChart = new Chart(
            document.getElementById('assets-allocation-line-chart'),
            config
        );
    }
};

export {simulationResultsController};