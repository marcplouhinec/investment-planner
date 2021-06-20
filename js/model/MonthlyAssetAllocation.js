import {YearMonth} from './YearMonth.js';
import {Asset} from './Asset.js';

class MonthlyAssetAllocation {

    /**
     * @param {YearMonth} yearMonth
     * @param {Asset} asset
     * @param {number} allocationRatio Between 0 and 1 (0 = no money in invested in this asset, 1 = all the money is invested in this asset).
     */
    constructor(yearMonth, asset, allocationRatio) {
        /** @type {YearMonth} */
        this.yearMonth = yearMonth;
        /** @type {Asset} */
        this.asset = asset;
        /** @type {number} */
        this.allocationRatio = allocationRatio;
    }
}

export {MonthlyAssetAllocation};