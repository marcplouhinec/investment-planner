import {YearMonth} from './YearMonth.js';

class MonthlyAssetAllocation {

    /**
     * @param {YearMonth} yearMonth
     * @param {string} assetCode
     * @param {number} allocationWeight
     * @param {number} allocationRatio Between 0 and 1 (0 = no money in invested in this asset, 1 = all the money is invested in this asset).
     */
    constructor(yearMonth, assetCode, allocationWeight, allocationRatio) {
        /** @type {YearMonth} */
        this.yearMonth = yearMonth;
        /** @type {string} */
        this.assetCode = assetCode;
        /** @type {number} */
        this.allocationWeight = allocationWeight;
        /** @type {number} */
        this.allocationRatio = allocationRatio;
    }
}

export {MonthlyAssetAllocation};