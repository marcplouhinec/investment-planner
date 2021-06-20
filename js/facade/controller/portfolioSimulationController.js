import {Chart} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';
import {simulationConfigService} from '../../service/simulationConfigService.js';
import {historicalPriceReadingService} from '../../service/historicalPriceReadingService.js';
import {historicalPriceAnalysisService} from '../../service/historicalPriceAnalysisService.js';
import {Asset} from '../../model/Asset.js';
import {HistoricalPrice} from '../../model/HistoricalPrice.js';
import {chartColorUtils} from "../utils/chartColorUtils.js";
import {YearMonth} from "../../model/YearMonth.js";
import {RegressionResult} from "../../model/RegressionResult.js";

const portfolioSimulationController = {

    /** @type {Map<string, Asset>} */
    _assetByCode: new Map(),
    /** @type {Map<Asset, HistoricalPrice[]>} */
    _historicalPricesByAsset: new Map(),
    /** @type {Map<Asset, {yearMonth: YearMonth, historicalPrice: HistoricalPrice}[]>} */
    _monthlyHistoricalPricesByAsset: new Map(),
    /** @type {Map<Asset, {performance: number, stdDev: number}>} */
    _annualizedPerfAndStdDevByAsset: new Map(),
    /** @type {Map<Asset, RegressionResult>} */
    _regressionResultByAsset: new Map(),
    /** @type {Map<Asset, MonthlyPrediction[]>} */
    _monthlyPredictionsByAsset: new Map(),
    /** @type {?Chart} */
    _assetPerfStdDevXyScatterChart: null,
    /** @type {?Chart} */
    _assetMonthlyPerfStdErrXyScatterChart: null,
    /** @type {?Chart} */
    _portfolioAssetPriceLineChart: null,

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
        // Map the asset by their code
        for (let asset of config.assets) {
            if (!this._assetByCode.has(asset.code)) {
                this._assetByCode.set(asset.code, asset);
            }
        }

        // Load the historical prices of all assets
        for (let asset of config.assets) {
            if (!this._historicalPricesByAsset.has(asset)) {
                const prices = await historicalPriceReadingService.readHistoricalPrices(asset);
                this._historicalPricesByAsset.set(asset, prices);
            }
        }
        const startYearMonth = config.scope.startYearMonth;
        const endYearMonth = config.scope.endYearMonth;
        for (let asset of config.assets) {
            if (!this._monthlyHistoricalPricesByAsset.has(asset)) {
                const historicalPrices = this._historicalPricesByAsset.get(asset);
                this._monthlyHistoricalPricesByAsset.set(
                    asset, HistoricalPrice.findAllEveryMonthBetween(historicalPrices, startYearMonth, endYearMonth));
            }
        }

        // Calculate the annualized performance and standard deviation for all assets
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

        // Calculate a regression for all assets
        for (let asset of config.assets) {
            if (!this._regressionResultByAsset.has(asset)) {
                const prices = this._historicalPricesByAsset.get(asset);

                this._regressionResultByAsset.set(
                    asset, historicalPriceAnalysisService.calculateRegression(prices, startYearMonth, endYearMonth));
            }
        }

        // Calculate monthly predictions for all assets
        for (let asset of config.assets) {
            if (!this._monthlyPredictionsByAsset.has(asset)) {
                const regressionResult = this._regressionResultByAsset.get(asset);
                this._monthlyPredictionsByAsset.set(
                    asset, historicalPriceAnalysisService.generateMonthlyPredictions(regressionResult, endYearMonth));
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
            datasets: config.assets.map((asset, index) => {
                const chartColor = chartColorUtils.getChartColorByIndex(index);
                const result = this._regressionResultByAsset.get(asset);
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
        const enabledInvestments = config.portfolioInvestments
            .filter(investment => investment.enabled)
            .filter(investment => this._assetByCode.has(investment.assetCode));

        const chartStartYearMonth = enabledInvestments
            .map(investment => {
                const asset = this._assetByCode.get(investment.assetCode);
                const monthlyHistoricalPrices = this._monthlyHistoricalPricesByAsset.get(asset);

                return monthlyHistoricalPrices[0].yearMonth;
            })
            .reduce((minYearMonth, currentValue) =>
                minYearMonth && minYearMonth.isBefore(currentValue) ? minYearMonth : currentValue);
        const yearMonths = YearMonth.generateRangeBetween(chartStartYearMonth, endYearMonth);

        const portfolioAssetPriceDatasets = enabledInvestments
            .map((investment, index) => {
                const asset = this._assetByCode.get(investment.assetCode);
                const monthlyHistoricalPrices = this._monthlyHistoricalPricesByAsset.get(asset);
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
                const asset = this._assetByCode.get(investment.assetCode);
                const monthlyPredictions = this._monthlyPredictionsByAsset.get(asset);

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