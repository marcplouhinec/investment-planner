class Year {

    /**
     * @param {number} year
     * @return {boolean}
     */
    static isLeapYear(year) {
        return ((year & 3) === 0) && ((year % 100) !== 0 || (year % 400) === 0);
    }

}

export {Year};