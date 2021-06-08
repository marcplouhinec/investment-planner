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

        // Compute the weight of each investment for each year-month
        const enabledInvestments = config.portfolioInvestments.filter(investment => investment.enabled);

        /** @type {{investment: PortfolioInvestment, weightByYearMonth: Map<YearMonth, number>}[]} */
        const investmentAndWeightByYearMonth = enabledInvestments.map(investment => {
            const weightByYearMonth = new Map();
            yearMonths.forEach(yearMonth => {
                weightByYearMonth.set(yearMonth, investment.computeWeightAt(yearMonth));
            });

            return {
                investment: investment,
                weightByYearMonth: weightByYearMonth
            };
        });

        // Scale the weights so that their sum become equals to 100
        /** @type {Map<YearMonth, number>} */
        const totalWeightByYearMonth = new Map();
        yearMonths.forEach(yearMonth => {
            const totalWeight = investmentAndWeightByYearMonth
                .map(it => it.weightByYearMonth.get(yearMonth))
                .reduce((total, value) => total + value, 0);
            totalWeightByYearMonth.set(yearMonth, totalWeight);
        });

        /** @type {{investment: PortfolioInvestment, percentageByYearMonth: Map<YearMonth, number>}[]} */
        const investmentAndPercentageByYearMonth = investmentAndWeightByYearMonth.map(it => {
            /** @type {Map<YearMonth, number>} */
            const percentageByYearMonth = new Map();
            it.weightByYearMonth.forEach((weight, yearMonth) => {
                const totalWeight = totalWeightByYearMonth.get(yearMonth);
                percentageByYearMonth.set(yearMonth, weight * 100 / totalWeight);
            });

            return {
                investment: it.investment,
                percentageByYearMonth: percentageByYearMonth
            };
        });

        // Draw the asset weight line chart
        const assetWeightLineChartData = {
            labels: yearMonths.map(it => it.toString()),
            datasets: investmentAndPercentageByYearMonth
                .map((it, index) => {
                    const chartColor = this._CHART_COLORS[index % this._CHART_COLORS.length];
                    return {
                        label: it.investment.assetCode,
                        backgroundColor: chartColor.backgroundColor,
                        borderColor: chartColor.borderColor,
                        data: yearMonths.map(yearMonth => it.percentageByYearMonth.get(yearMonth))
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
                        pointRadius: 0,
                        scales: {
                            y: {
                                min: 0,
                                max: 100
                            }
                        }
                    },
                    data: assetWeightLineChartData
                }
            );
        }
    }
};

export {simulationResultsController};