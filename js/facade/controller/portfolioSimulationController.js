import {Chart} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';
import {simulationConfigService} from '../../service/simulationConfigService.js';
import {chartColorUtils} from "../utils/chartColorUtils.js";
import {YearMonth} from "../../model/YearMonth.js";
import {Simulation} from "../../model/Simulation.js";

const portfolioSimulationController = {

    /** @type {?Chart} */
    _assetPerfStdDevXyScatterChart: null,
    /** @type {?Chart} */
    _assetMonthlyPerfStdErrXyScatterChart: null,
    /** @type {?Chart} */
    _portfolioAssetPriceLineChart: null,

    init: function () {
        // Listen to simulation config changes
        simulationConfigService.registerConfigUpdatedListener(async simulation => {
            await this._refreshPortfolioSimulation(simulation);
        });
    },

    /**
     * @param {Simulation} simulation
     */
    _refreshPortfolioSimulation: async function (simulation) {
        // Draw the asset performance / Standard Deviation XY scatter chart
        const assetPerfStdDevXyScatterChartData = {
            datasets: simulation.config.assets.map((asset, index) => {
                const chartColor = chartColorUtils.getChartColorByIndex(index);
                const annualizedPerfAndStdDev = simulation.annualizedPerfAndStdDevByAssetCode.get(asset.code);
                return {
                    label: asset.code,
                    data: [{
                        x: annualizedPerfAndStdDev.stdDev,
                        y: annualizedPerfAndStdDev.performance * 100
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
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Annualized Standard Deviation / Annualized performance (%)'
                            }
                        }
                    }
                }
            );
        }

        // Draw the asset monthly performance / Standard Error XY scatter chart
        const assetMonthlyPerfStdErrXyScatterChartData = {
            datasets: simulation.config.assets.map((asset, index) => {
                const chartColor = chartColorUtils.getChartColorByIndex(index);
                const result = simulation.regressionResultByAssetCode.get(asset.code);
                return {
                    label: asset.code,
                    data: [{
                        x: result.standardError,
                        y: result.monthlyPerformance * 100
                    }],
                    backgroundColor: chartColor.borderColor
                };
            })
        };
        if (this._assetMonthlyPerfStdErrXyScatterChart !== null) {
            this._assetMonthlyPerfStdErrXyScatterChart.data = assetMonthlyPerfStdErrXyScatterChartData;
            this._assetMonthlyPerfStdErrXyScatterChart.update();
        } else {
            this._assetMonthlyPerfStdErrXyScatterChart = new Chart(
                document.getElementById('asset-monthly_perf-stderr-xy-scatter-chart'),
                {
                    type: 'scatter',
                    data: assetMonthlyPerfStdErrXyScatterChartData,
                    options: {
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom'
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Monthly Standard Error / Monthly performance (%)'
                            }
                        }
                    }
                }
            );
        }

        // Draw the assets historical prices, regression line, and 95% envelope
        const enabledInvestments = simulation.config.portfolioInvestments
            .filter(investment => investment.enabled);

        const chartStartYearMonth = enabledInvestments
            .map(investment => {
                const monthlyHistoricalPrices = simulation.monthlyHistoricalPricesByAssetCode.get(investment.assetCode);

                return monthlyHistoricalPrices[0].yearMonth;
            })
            .reduce((minYearMonth, currentValue) =>
                minYearMonth && minYearMonth.isBefore(currentValue) ? minYearMonth : currentValue);
        const yearMonths = YearMonth.generateRangeBetween(
            chartStartYearMonth, simulation.config.scope.endYearMonth);

        const portfolioAssetPriceDatasets = enabledInvestments
            .map((investment, index) => {
                const monthlyHistoricalPrices = simulation.monthlyHistoricalPricesByAssetCode.get(investment.assetCode);
                const minYearMonth = monthlyHistoricalPrices[0].yearMonth;
                const maxYearMonth = monthlyHistoricalPrices[monthlyHistoricalPrices.length - 1].yearMonth;

                const chartColor = chartColorUtils.getChartColorByIndex(index);
                return {
                    label: investment.assetCode,
                    backgroundColor: chartColor.backgroundColor,
                    borderColor: chartColor.borderColor,
                    data: yearMonths.map(yearMonth => {
                        if (yearMonth.isBefore(minYearMonth) || yearMonth.isAfter(maxYearMonth)) {
                            return null;
                        }
                        const index = YearMonth.nbMonthsBetween(minYearMonth, yearMonth);
                        return monthlyHistoricalPrices[index].historicalPrice.priceInUsd;
                    })
                };
            });

        const regressionDataSet = enabledInvestments
            .flatMap((investment, index) => {
                const monthlyPredictions = simulation.monthlyPredictionsByAssetCode.get(investment.assetCode);

                const monthlyPredictionByYearMonth = new Map();
                for (let monthlyPrediction of monthlyPredictions) {
                    monthlyPredictionByYearMonth.set(monthlyPrediction.yearMonth.toString(), monthlyPrediction);
                }

                const chartColor = chartColorUtils.getChartColorByIndex(index);
                return [
                    {
                        label: investment.assetCode + ' (regression)',
                        backgroundColor: chartColor.backgroundColor,
                        borderColor: chartColor.borderColor,
                        data: yearMonths.map(yearMonth => {
                            const monthlyPrediction = monthlyPredictionByYearMonth.get(yearMonth.toString());
                            if (!monthlyPrediction) {
                                return null;
                            }
                            return monthlyPrediction.avgPriceInUsd;
                        })
                    },
                    {
                        label: investment.assetCode + ' (lower 95%)',
                        backgroundColor: chartColor.backgroundColor,
                        borderColor: chartColor.borderColor,
                        data: yearMonths.map(yearMonth => {
                            const monthlyPrediction = monthlyPredictionByYearMonth.get(yearMonth.toString());
                            if (!monthlyPrediction) {
                                return null;
                            }
                            return monthlyPrediction.lower95PriceInUsd;
                        })
                    },
                    {
                        label: investment.assetCode + ' (upper 95%)',
                        backgroundColor: chartColor.backgroundColor,
                        borderColor: chartColor.borderColor,
                        data: yearMonths.map(yearMonth => {
                            const monthlyPrediction = monthlyPredictionByYearMonth.get(yearMonth.toString());
                            if (!monthlyPrediction) {
                                return null;
                            }
                            return monthlyPrediction.upper95PriceInUsd;
                        })
                    }
                ];
            });

        const portfolioAssetPriceLineChartData = {
            labels: yearMonths.map(it => it.toString()),
            datasets: portfolioAssetPriceDatasets.concat(regressionDataSet)
        };

        if (this._portfolioAssetPriceLineChart !== null) {
            this._portfolioAssetPriceLineChart.data = portfolioAssetPriceLineChartData;
            this._portfolioAssetPriceLineChart.update();
        } else {
            this._portfolioAssetPriceLineChart = new Chart(
                document.getElementById('asset-portfolio-price-line-chart'),
                {
                    type: 'line',
                    options: {
                        pointRadius: 0,
                        aspectRatio: 1,
                        plugins: {
                            legend: {
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: 'Asset prices (USD)'
                            }
                        }
                    },
                    data: portfolioAssetPriceLineChartData
                }
            );
        }
    }

};

export {portfolioSimulationController};