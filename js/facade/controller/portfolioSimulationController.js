import {Chart} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';
import {simulationConfigService} from '../../service/simulationConfigService.js';
import {historicalPriceReadingService} from '../../service/historicalPriceReadingService.js';
import {historicalPriceAnalysisService} from '../../service/historicalPriceAnalysisService.js';
import {Asset} from '../../model/Asset.js';
import {HistoricalPrice} from '../../model/HistoricalPrice.js';
import {chartColorUtils} from "../utils/chartColorUtils.js";

const portfolioSimulationController = {

    /** @type {Map<Asset, HistoricalPrice[]>} */
    _historicalPricesByAsset: new Map(),
    /** @type {Map<Asset, {performance: number, stdDev: number}>} */
    _annualizedPerfAndStdDevByAsset: new Map(),
    /** @type {?Chart} */
    _assetPerfStdDevXyScatterChart: null,

    init: function () {
        // Listen to simulation config changes
        simulationConfigService.registerConfigUpdatedListener(async simulationConfig => {
            await this._refreshPortfolioSimulation(simulationConfig);
        });
    },

    /**
     * @param {SimulationConfig} config
     */
    _refreshPortfolioSimulation: async function (config) {
        // Load the historical prices of all assets
        for (let asset of config.assets) {
            if (!this._historicalPricesByAsset.has(asset)) {
                const prices = await historicalPriceReadingService.readHistoricalPrices(asset);
                this._historicalPricesByAsset.set(asset, prices);
            }
        }

        // Calculate the annualized performance and standard deviation for all assets
        const startYearMonth = config.scope.startYearMonth;
        const endYearMonth = config.scope.endYearMonth;
        for (let asset of config.assets) {
            if (!this._annualizedPerfAndStdDevByAsset.has(asset)) {
                const prices = this._historicalPricesByAsset.get(asset);

                this._annualizedPerfAndStdDevByAsset.set(asset, {
                    performance: historicalPriceAnalysisService
                        .calculateAnnualizedPerformance(prices, startYearMonth, endYearMonth),
                    stdDev: historicalPriceAnalysisService
                        .calculateAnnualizedPerformanceStandardDeviation(prices, startYearMonth, endYearMonth)
                });
            }
        }

        // Draw the asset performance / Standard Deviation XY scatter chart
        const assetPerfStdDevXyScatterChartData = {
            datasets: config.assets.map((asset, index) => {
                const chartColor = chartColorUtils.getChartColorByIndex(index);
                const annualizedPerfAndStdDev = this._annualizedPerfAndStdDevByAsset.get(asset);
                return {
                    label: asset.code,
                    data: [{
                        x: annualizedPerfAndStdDev.stdDev,
                        y: annualizedPerfAndStdDev.performance
                    }],
                    backgroundColor: chartColor.borderColor
                };
            })
        };
        if (this._assetPerfStdDevXyScatterChart !== null) {
            this._assetPerfStdDevXyScatterChart.data = assetPerfStdDevXyScatterChartData;
            this._assetPerfStdDevXyScatterChart.update();
        } else {
            this._assetPerfStdDevXyScatterChart = new Chart(
                document.getElementById('asset-perf-stddev-xy-scatter-chart'),
                {
                    type: 'scatter',
                    data: assetPerfStdDevXyScatterChartData,
                    options: {
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom'
                            }
                        }
                    }
                }
            );
        }

    }

};

export {portfolioSimulationController};