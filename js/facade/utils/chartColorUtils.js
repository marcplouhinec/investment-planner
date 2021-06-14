const chartColorUtils = {
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

    /**
     * @param {number} index
     * @return {{backgroundColor: string, borderColor: string}}
     */
    getChartColorByIndex: function (index) {
        return this._CHART_COLORS[index % this._CHART_COLORS.length];
    }
};

export {chartColorUtils};