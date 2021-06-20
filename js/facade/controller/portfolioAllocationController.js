import {Chart, registerables} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';
import {simulationConfigService} from '../../service/simulationConfigService.js';
import {Simulation} from "../../model/Simulation.js";
import {chartColorUtils} from "../utils/chartColorUtils.js";

const portfolioAllocationController = {

    /** @type {?Chart} */
    _assetWeightLineChart: null,

    /** @type {?Chart} */
    _assetWeightAreaChart: null,

    init: function () {
        // Initialize Chart.js
        Chart.register(...registerables);

        // Listen to simulation config changes
        simulationConfigService.registerConfigUpdatedListener(simulation => {
            this._refreshPortfolioAllocation(simulation);
        });
    },

    /**
     * @param {Simulation} simulation
     */
    _refreshPortfolioAllocation: function (simulation) {
        const allocationByYearMonthByAssetCode = simulation.getPortfolioMonthlyAssetAllocationByYearMonthByAssetCode();

        // Draw the asset weight line chart
        /**
         * @type {{
         *     label: string,
         *     backgroundColor: string,
         *     borderColor: string,
         *     fill: string,
         *     data: number[]
         * }[]}
         */
        const assetWeightLineChartDatasets = [];
        let assetIndex = 0;
        for (const [assetCode, allocationByYearMonth] of allocationByYearMonthByAssetCode) {
            const chartColor = chartColorUtils.getChartColorByIndex(assetIndex);

            assetWeightLineChartDatasets.push({
                label: assetCode,
                backgroundColor: chartColor.backgroundColor,
                borderColor: chartColor.borderColor,
                data: simulation.portfolioYearMonths.map(yearMonth => {
                    /** @type {MonthlyAssetAllocation} */
                    const allocation = allocationByYearMonth.get(yearMonth.toString());
                    return allocation.allocationRatio * 100;
                })
            });

            assetIndex++;
        }

        const assetWeightLineChartData = {
            labels: simulation.portfolioYearMonths.map(it => it.toString()),
            datasets: assetWeightLineChartDatasets
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

        // Draw the asset weight area chart
        /**
         * @type {{
         *     label: string,
         *     backgroundColor: string,
         *     borderColor: string,
         *     fill: string,
         *     data: number[]
         * }[]}
         */
        const assetWeightAreaChartDatasets = [];
        assetIndex = 0;
        for (const [assetCode, allocationByYearMonth] of allocationByYearMonthByAssetCode) {
            const chartColor = chartColorUtils.getChartColorByIndex(assetIndex);

            assetWeightAreaChartDatasets.push({
                label: assetCode,
                backgroundColor: chartColor.borderColor,
                borderColor: chartColor.borderColor,
                fill: 'origin',
                data: simulation.portfolioYearMonths.map((yearMonth, ymIndex) => {
                    /** @type {MonthlyAssetAllocation} */
                    const allocation = allocationByYearMonth.get(yearMonth.toString());

                    const previousValue = assetIndex === 0 ? 0 : assetWeightAreaChartDatasets[assetIndex - 1].data[ymIndex];
                    return previousValue + allocation.allocationRatio * 100;
                })
            });

            assetIndex++;
        }

        const assetWeightAreaChartData = {
            labels: simulation.portfolioYearMonths.map(it => it.toString()),
            datasets: assetWeightAreaChartDatasets
        };

        if (this._assetWeightAreaChart !== null) {
            this._assetWeightAreaChart.data = assetWeightAreaChartData;
            this._assetWeightAreaChart.update();
        } else {
            this._assetWeightAreaChart = new Chart(
                document.getElementById('asset-weight-area-chart'),
                {
                    type: 'line',
                    options: {
                        pointRadius: 0,
                        plugins: {
                            filler: {
                                propagate: false,
                            }
                        },
                        scales: {
                            y: {
                                min: 0,
                                max: 100,
                            }
                        }
                    },
                    data: assetWeightAreaChartData
                }
            );
        }
    }
};

export {portfolioAllocationController};