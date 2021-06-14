import {Chart} from '../../../vendors/chart.js-3.3.2/dist/chart.esm.js';
import {simulationConfigService} from '../../service/simulationConfigService.js';
import {historicalPriceReadingService} from '../../service/historicalPriceReadingService.js';
import {historicalPriceAnalysisService} from '../../service/historicalPriceAnalysisService.js';
import {Asset} from '../../model/Asset.js';
import {HistoricalPrice} from '../../model/HistoricalPrice.js';
import {chartColorUtils} from "../utils/chartColorUtils.js";
import {YearMonth} from "../../model/YearMonth.js";
import {LocalDate} from "../../model/LocalDate.js";

const portfolioSimulationController = {

    /** @type {Map<string, Asset>} */
    _assetByCode: new Map(),
    /** @type {Map<Asset, HistoricalPrice[]>} */
    _historicalPricesByAsset: new Map(),
    /** @type {Map<Asset, Map<LocalDate, HistoricalPrice>>} */
    _historicalPriceByLocalDateByAsset: new Map(),
    /** @type {Map<Asset, {performance: number, stdDev: number}>} */
    _annualizedPerfAndStdDevByAsset: new Map(),
    /** @type {?Chart} */
    _assetPerfStdDevXyScatterChart: null,
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
        for (let asset of config.assets) {
            if (!this._historicalPriceByLocalDateByAsset.has(asset)) {
                const historicalPrices = this._historicalPricesByAsset.get(asset);
                const historicalPriceByLocalDate = new Map();
                for (let historicalPrice of historicalPrices) {
                    historicalPriceByLocalDate.set(historicalPrice.date, historicalPrice);
                }
                this._historicalPriceByLocalDateByAsset.set(asset, historicalPriceByLocalDate);
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
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Annualized Standard Deviation / Annualized performance'
                            }
                        }
                    }
                }
            );
        }

        // Draw the assets historical prices, annualized performance, and 95% envelope
        const enabledInvestments = config.portfolioInvestments
            .filter(investment => investment.enabled)
            .filter(investment => this._assetByCode.has(investment.assetCode));
        const startLocalDate = enabledInvestments
            .map(investment => {
                const asset = this._assetByCode.get(investment.assetCode);
                const historicalPrices = this._historicalPricesByAsset.get(asset);
                return historicalPrices[0].date;
            })
            .reduce((minDate, currentDate) =>
                !minDate ? currentDate : minDate.isBefore(currentDate) ? minDate : currentDate);
        const yearMonths = YearMonth.generateRangeBetween(startLocalDate.toYearMonth(), endYearMonth);

        const portfolioAssetPriceLineChartData = {
            labels: yearMonths.map(it => it.toString()),
            datasets: enabledInvestments
                .map((investment, index) => {
                    const asset = this._assetByCode.get(investment.assetCode);
                    const historicalPrices = this._historicalPricesByAsset.get(asset);
                    const historicalPriceByLocalDate = this._historicalPriceByLocalDateByAsset.get(asset);
                    const dates = historicalPrices.map(price => price.date);
                    const earliestDate = dates[0];
                    const latestDate = dates[dates.length - 1];

                    const chartColor = chartColorUtils.getChartColorByIndex(index);
                    return {
                        label: investment.assetCode,
                        backgroundColor: chartColor.backgroundColor,
                        borderColor: chartColor.borderColor,
                        data: yearMonths.map(yearMonth => {
                            const localDate = yearMonth.atDay(1);
                            if (localDate.isBefore(earliestDate) || localDate.isAfter(latestDate)) {
                                return null;
                            }
                            const date = LocalDate.findClosestAvailableLocalDate(dates, localDate);
                            return historicalPriceByLocalDate.get(date).priceInUsd;
                        })
                    };
                })
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
                        plugins: {
                            legend: {
                                position: 'top',
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