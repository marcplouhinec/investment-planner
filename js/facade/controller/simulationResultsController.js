import {Chart, registerables} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';
import {simulationConfigService} from '../../service/simulationConfigService.js';
import {YearMonth} from '../../model/YearMonth.js';
import {PortfolioInvestment} from "../../model/PortfolioInvestment.js";

const simulationResultsController = {

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
            datasets: config.portfolioInvestments.map(investment => {
                return {
                    label: investment.assetCode,
                    backgroundColor: 'rgb(255, 99, 132)', // TODO
                    borderColor: 'rgb(255, 99, 132)', // TODO
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