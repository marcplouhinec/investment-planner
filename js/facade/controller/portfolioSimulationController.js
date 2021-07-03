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
    _portfolioAssetPriceFromOneUsdLineChart: null,
    /** @type {?Chart} */
    _portfolioAssetPriceLineChart: null,
    /** @type {?Chart} */
    _portfolioPriceLineChart: null,
    /** @type {HTMLTableElement} */
    _monthlyPredictionTable: null,

    init: function () {
        // Listen to simulation config changes
        simulationConfigService.registerConfigUpdatedListener(async simulation => {
            await this._refreshPortfolioSimulation(simulation);
        });

        this._monthlyPredictionTable =
            /** @type {HTMLTableElement} */ document.getElementById('monthly-prediction-table');
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
                            },
                            tooltip: {
                                callbacks: {
                                    footer: (tooltipItems) => {
                                        return tooltipItems[0].dataset.label;
                                    }
                                }
                            }
                        }
                    }
                }
            );
        }

        // Draw the asset monthly performance / Standard Error XY scatter chart
        const assetMonthlyPerfStdErrXyScatterChartDataSets = simulation.config.assets.map((asset, index) => {
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
        });
        // Add the portfolio monthly performance / Standard Error across time
        const portfolioMPerfAndStdErrPerYear = simulation.getAllPortfolioMonthlyPerformanceAndStandardErrorPerYear();
        const portfolioMPerfAndStdErrPerYearXyScatterChartDataSets = portfolioMPerfAndStdErrPerYear.map((it, index) => {
            const redColor = Math.round(index * 255 / portfolioMPerfAndStdErrPerYear.length);
            return {
                label: '' + it.year,
                data: [{
                    x: it.standardError,
                    y: it.monthlyPerformance * 100
                }],
                backgroundColor: 'rgb(' + redColor + ', 99, 132)'
            };
        });
        const assetMonthlyPerfStdErrXyScatterChartData = {
            datasets: assetMonthlyPerfStdErrXyScatterChartDataSets.concat(portfolioMPerfAndStdErrPerYearXyScatterChartDataSets)
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
                        aspectRatio: 1,
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
                            },
                            tooltip: {
                                callbacks: {
                                    footer: (tooltipItems) => {
                                        return tooltipItems[0].dataset.label;
                                    }
                                }
                            }
                        }
                    }
                }
            );
        }

        // Draw the asset and portfolio prices with an initial investment of one USD
        const assetPredictionByYearMonths = simulation.predictPortfolioAndAssetPricesStartingFromOneUsd();

        const averagePriceFromOneUsdDatasets = assetPredictionByYearMonths.map((it, index) => {
            const chartColor = chartColorUtils.getChartColorByIndex(index);
            return {
                label: it.assetCode + ' (regression)',
                backgroundColor: chartColor.backgroundColor,
                borderColor: chartColor.borderColor,
                data: simulation.portfolioYearMonths.map(yearMonth => {
                    const prediction = it.predictionByYearMonth.get(yearMonth.toString());
                    return prediction.avgPriceInUsd;
                })
            };
        });
        const lower95PriceFromOneUsdDatasets = assetPredictionByYearMonths.map((it, index) => {
            const chartColor = chartColorUtils.getChartColorByIndex(index);
            return {
                label: it.assetCode + ' (lower 95%)',
                backgroundColor: chartColor.backgroundColor,
                borderColor: chartColor.borderColor,
                data: simulation.portfolioYearMonths.map(yearMonth => {
                    const prediction = it.predictionByYearMonth.get(yearMonth.toString());
                    return prediction.lower95PriceInUsd;
                })
            };
        });
        const upper95PriceFromOneUsdDatasets = assetPredictionByYearMonths.map((it, index) => {
            const chartColor = chartColorUtils.getChartColorByIndex(index);
            return {
                label: it.assetCode + ' (upper 95%)',
                backgroundColor: chartColor.backgroundColor,
                borderColor: chartColor.borderColor,
                data: simulation.portfolioYearMonths.map(yearMonth => {
                    const prediction = it.predictionByYearMonth.get(yearMonth.toString());
                    return prediction.upper95PriceInUsd;
                })
            };
        });
        const portfolioAssetPriceStartingFromOneUsdLineChartData = {
            labels: simulation.portfolioYearMonths.map(it => it.toString()),
            datasets: averagePriceFromOneUsdDatasets
                .concat(lower95PriceFromOneUsdDatasets)
                .concat(upper95PriceFromOneUsdDatasets)
        };

        if (this._portfolioAssetPriceFromOneUsdLineChart !== null) {
            this._portfolioAssetPriceFromOneUsdLineChart.data = portfolioAssetPriceStartingFromOneUsdLineChartData;
            this._portfolioAssetPriceFromOneUsdLineChart.update();
        } else {
            this._portfolioAssetPriceFromOneUsdLineChart = new Chart(
                document.getElementById('asset-portfolio-price-from-one-usd-line-chart'),
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
                                text: 'Asset prices (USD) starting from one USD'
                            }
                        }
                    },
                    data: portfolioAssetPriceStartingFromOneUsdLineChartData
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

        const regressionDataSets = enabledInvestments
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
            datasets: portfolioAssetPriceDatasets.concat(regressionDataSets)
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

        // Draw the portfolio price
        /** @type {Map<string, MonthlyPrediction>} */
        const portfolioPredictionByYearMonth = simulation.predictPortfolioPrices();
        let accumulatedSavings = 0;
        let accumulatedRetirementPension = 0;
        const portfolioPredictionDatasets = [
            {
                label: 'PORTFOLIO',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                data: yearMonths.map(yearMonth => {
                    const monthlyPrediction = portfolioPredictionByYearMonth.get(yearMonth.toString());
                    if (!monthlyPrediction) {
                        return null;
                    }
                    return monthlyPrediction.avgPriceInUsd;
                })
            },
            {
                label: 'PORTFOLIO (lower 95%)',
                backgroundColor: chartColorUtils.getChartColorByIndex(0).backgroundColor,
                borderColor: chartColorUtils.getChartColorByIndex(0).borderColor,
                data: yearMonths.map(yearMonth => {
                    const monthlyPrediction = portfolioPredictionByYearMonth.get(yearMonth.toString());
                    if (!monthlyPrediction) {
                        return null;
                    }
                    return monthlyPrediction.lower95PriceInUsd;
                })
            },
            {
                label: 'PORTFOLIO (upper 95%)',
                backgroundColor: chartColorUtils.getChartColorByIndex(1).backgroundColor,
                borderColor: chartColorUtils.getChartColorByIndex(1).borderColor,
                data: yearMonths.map(yearMonth => {
                    const monthlyPrediction = portfolioPredictionByYearMonth.get(yearMonth.toString());
                    if (!monthlyPrediction) {
                        return null;
                    }
                    return monthlyPrediction.upper95PriceInUsd;
                })
            },
            {
                label: 'ACCUMULATED SAVINGS',
                backgroundColor: chartColorUtils.getChartColorByIndex(2).backgroundColor,
                borderColor: chartColorUtils.getChartColorByIndex(2).borderColor,
                data: yearMonths.map(yearMonth => {
                    accumulatedSavings += simulation.savedAmountInUsdPerYearMonth.get(yearMonth.toString()) || 0;
                    return accumulatedSavings;
                })
            },
            {
                label: 'ACCUMULATED RETIREMENT PENSION',
                backgroundColor: chartColorUtils.getChartColorByIndex(3).backgroundColor,
                borderColor: chartColorUtils.getChartColorByIndex(3).borderColor,
                data: yearMonths.map(yearMonth => {
                    accumulatedRetirementPension += simulation.retirementPensionInUsdPerYearMonth.get(yearMonth.toString()) || 0;
                    return accumulatedRetirementPension;
                })
            }];

        const portfolioPriceLineChartData = {
            labels: yearMonths.map(it => it.toString()),
            datasets: portfolioPredictionDatasets
        };

        if (this._portfolioPriceLineChart !== null) {
            this._portfolioPriceLineChart.data = portfolioPriceLineChartData;
            this._portfolioPriceLineChart.update();
        } else {
            this._portfolioPriceLineChart = new Chart(
                document.getElementById('portfolio-price-line-chart'),
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
                                text: 'Portfolio price (USD)'
                            }
                        }
                    },
                    data: portfolioPriceLineChartData
                }
            );
        }

        // Update the monthly prediction table
        const oldTBodies = this._monthlyPredictionTable.getElementsByTagName('tbody');
        this._monthlyPredictionTable.removeChild(oldTBodies.item(0));
        const tbody = document.createElement('tbody');

        let lastAvgPriceInUsd = 0;
        const numberFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
        for (const yearMonth of simulation.portfolioYearMonths) {
            const formattedYearMonth = yearMonth.toString();
            const prediction = portfolioPredictionByYearMonth.get(formattedYearMonth);
            const tr = document.createElement('tr');

            let td = document.createElement('td');
            td.textContent = formattedYearMonth;
            tr.appendChild(td);

            td = document.createElement('td');
            const retirementPension = simulation.retirementPensionInUsdPerYearMonth.get(formattedYearMonth) || 0;
            const saving = simulation.savedAmountInUsdPerYearMonth.get(formattedYearMonth) || 0;
            td.textContent = numberFormat.format(saving - retirementPension);
            tr.appendChild(td);

            td = document.createElement('td');
            td.textContent = numberFormat.format(prediction.avgPriceInUsd);
            tr.appendChild(td);

            td = document.createElement('td');
            td.textContent = numberFormat.format(prediction.lower95PriceInUsd);
            tr.appendChild(td);

            td = document.createElement('td');
            td.textContent = numberFormat.format(prediction.upper95PriceInUsd);
            tr.appendChild(td);

            td = document.createElement('td');
            td.textContent = numberFormat.format(prediction.avgPriceInUsd - lastAvgPriceInUsd);
            tr.appendChild(td);
            lastAvgPriceInUsd = prediction.avgPriceInUsd;

            tbody.appendChild(tr);
        }

        this._monthlyPredictionTable.appendChild(tbody);
    }
};

export {portfolioSimulationController};