import {YearMonth} from '../../js/model/YearMonth.js'

const assert = chai.assert;
const expect = chai.expect;

describe('YearMonth', () => {
    describe('#constructor()', () => {
        it('should parse string', () => {
            const yearMonth = new YearMonth('2021-06');
            assert.equal(yearMonth.year, 2021);
            assert.equal(yearMonth.month, 6);
        });

        it('should parse object', () => {
            const yearMonth = new YearMonth({
                year: 2020,
                month: 5
            });
            assert.equal(yearMonth.year, 2020);
            assert.equal(yearMonth.month, 5);
        });

        it('should parse null', () => {
            const yearMonth = new YearMonth(null);
            assert.equal(yearMonth.year, 0);
            assert.equal(yearMonth.month, 0);
        });

        it('should parse blank string', () => {
            const yearMonth = new YearMonth(' \t \n ');
            assert.equal(yearMonth.year, 0);
            assert.equal(yearMonth.month, 0);
        });

        it('should fail on invalid string', () => {
            expect(() => {
                new YearMonth('202-01')
            }).to.throw("The value '202-01' is not a valid YearMonth. The correct syntax is 'YYYY-MM'.");
        });
    });
});
