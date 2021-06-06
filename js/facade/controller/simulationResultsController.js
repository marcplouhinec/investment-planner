import {Chart, registerables} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';
import {simulationConfigService} from '../../service/simulationConfigService.js';
import {YearMonth} from '../../model/YearMonth.js';
import {PortfolioInvestment} from "../../model/PortfolioInvestment.js";

const simulationResultsController = {

    /**
     * @constant
     * @type {{backgroundColor:string, borderColor:string}[]}
     */
    _CHART_COLORS: [
        {
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)'
        },
        {
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)'
        },
        {
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)'
        },
        {
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)'
        },
        {
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)'
        }
    ],

    /** @type {?Chart} */
    _assetWeightLineChart: null,

    init: function () {
        // Initialize Chart.js
        Chart.register(...registerables);

        // Listen to simulation config changes
        simulationConfigService.registerConfigUpdatedListener(simulationConfig => {
            this._refreshPortfolioAllocation(simulationConfig);
        });
    },

    /**
     * @param {SimulationConfig} config
     */
    _refreshPortfolioAllocation: function (config) {
        // Generate the points in time
        const yearMonths = YearMonth.generateRangeBetween(
            PortfolioInvestment.findStartYearMonth(config.portfolioInvestments),
            PortfolioInvestment.findEndYearMonth(config.portfolioInvestments));

        // Draw the asset weight line chart
        const assetWeightLineChartData = {
            labels: yearMonths.map(it => it.toString()),
            datasets: config.portfolioInvestments
                .filter(it => it.enabled)
                .map((investment, index) => {
                    const chartColor = this._CHART_COLORS[index % this._CHART_COLORS.length];
                    return {
                        label: investment.assetCode,
                        backgroundColor: chartColor.backgroundColor,
                        borderColor: chartColor.borderColor,
                        data: yearMonths.map(it => investment.computeWeightAt(it))
                    };
                })
        };

        if (this._assetWeightLineChart !== null) {
            this._assetWeightLineChart.data = assetWeightLineChartData;
            this._assetWeightLineChart.update();
        } else {
            this._assetWeightLineChart = new Chart(
                document.getElementById('asset-weight-line-chart'),
                {
                    type: 'line',
                    options: {
                        pointRadius: 0
                    },
                    data: assetWeightLineChartData
                }
            );
        }
    }
};

export {simulationResultsController};