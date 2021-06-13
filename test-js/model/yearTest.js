import {Year} from '../../js/model/Year.js'

const assert = chai.assert;
const expect = chai.expect;

describe('Year', () => {
    describe('#isLeapYear()', () => {
        it('should work with non-null years', () => {
            assert.equal(Year.isLeapYear(2021), false);
            assert.equal(Year.isLeapYear(1904), true);
            assert.equal(Year.isLeapYear(1900), false);
            assert.equal(Year.isLeapYear(2000), true);
        });
    });
});
