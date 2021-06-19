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

    describe('#generateRangeBetween()', () => {
        it('should work within the same year', () => {
            const yearMonths = YearMonth.generateRangeBetween(
                new YearMonth('2021-02'), new YearMonth('2021-06'));
            assert.equal(yearMonths.length, 5);
            assert.equal(yearMonths[0].year, 2021);
            assert.equal(yearMonths[0].month, 2);
            assert.equal(yearMonths[1].year, 2021);
            assert.equal(yearMonths[1].month, 3);
            assert.equal(yearMonths[2].year, 2021);
            assert.equal(yearMonths[2].month, 4);
            assert.equal(yearMonths[3].year, 2021);
            assert.equal(yearMonths[3].month, 5);
            assert.equal(yearMonths[4].year, 2021);
            assert.equal(yearMonths[4].month, 6);
        });

        it('should work across years', () => {
            const yearMonths = YearMonth.generateRangeBetween(
                new YearMonth('2020-10'), new YearMonth('2021-02'));
            assert.equal(yearMonths.length, 5);
            assert.equal(yearMonths[0].year, 2020);
            assert.equal(yearMonths[0].month, 10);
            assert.equal(yearMonths[1].year, 2020);
            assert.equal(yearMonths[1].month, 11);
            assert.equal(yearMonths[2].year, 2020);
            assert.equal(yearMonths[2].month, 12);
            assert.equal(yearMonths[3].year, 2021);
            assert.equal(yearMonths[3].month, 1);
            assert.equal(yearMonths[4].year, 2021);
            assert.equal(yearMonths[4].month, 2);
        });
    });

    describe('#compareAsc()', () => {
        it('should work with multiple dates', () => {
            const yearMonths = [
                new YearMonth('2021-02'),
                new YearMonth('2021-05'),
                new YearMonth('2020-12'),
                new YearMonth('2020-10'),
            ];

            const sortedYearMonths = yearMonths.sort(YearMonth.compareAsc);

            assert.equal(sortedYearMonths.length, 4);
            assert.equal(sortedYearMonths[0].year, 2020);
            assert.equal(sortedYearMonths[0].month, 10);
            assert.equal(sortedYearMonths[1].year, 2020);
            assert.equal(sortedYearMonths[1].month, 12);
            assert.equal(sortedYearMonths[2].year, 2021);
            assert.equal(sortedYearMonths[2].month, 2);
            assert.equal(sortedYearMonths[3].year, 2021);
            assert.equal(sortedYearMonths[3].month, 5);
        });
    });

    describe('#compareDesc()', () => {
        it('should work with multiple dates', () => {
            const yearMonths = [
                new YearMonth('2021-02'),
                new YearMonth('2021-05'),
                new YearMonth('2020-12'),
                new YearMonth('2020-10'),
            ];

            const sortedYearMonths = yearMonths.sort(YearMonth.compareDesc);

            assert.equal(sortedYearMonths.length, 4);
            assert.equal(sortedYearMonths[0].year, 2021);
            assert.equal(sortedYearMonths[0].month, 5);
            assert.equal(sortedYearMonths[1].year, 2021);
            assert.equal(sortedYearMonths[1].month, 2);
            assert.equal(sortedYearMonths[2].year, 2020);
            assert.equal(sortedYearMonths[2].month, 12);
            assert.equal(sortedYearMonths[3].year, 2020);
            assert.equal(sortedYearMonths[3].month, 10);
        });
    });

    describe('#isBefore()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new YearMonth('2021-02').isBefore(new YearMonth('2021-05')), true);
            assert.equal(new YearMonth('2020-12').isBefore(new YearMonth('2021-05')), true);
            assert.equal(new YearMonth('2020-12').isBefore(new YearMonth('2020-10')), false);
            assert.equal(new YearMonth('2021-10').isBefore(new YearMonth('2020-10')), false);
        });
    });

    describe('#isAfter()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new YearMonth('2021-02').isAfter(new YearMonth('2021-05')), false);
            assert.equal(new YearMonth('2020-12').isAfter(new YearMonth('2021-05')), false);
            assert.equal(new YearMonth('2020-12').isAfter(new YearMonth('2020-10')), true);
            assert.equal(new YearMonth('2021-10').isAfter(new YearMonth('2020-10')), true);
        });
    });

    describe('#equals()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new YearMonth('2021-02').equals(new YearMonth('2021-02')), true);
            assert.equal(new YearMonth('2020-12').equals(new YearMonth('2021-12')), false);
            assert.equal(new YearMonth('2021-12').equals(new YearMonth('2021-01')), false);
            assert.equal(new YearMonth('2020-12').equals(new YearMonth('2021-01')), false);
        });
    });

    describe('#nbMonthsBetween()', () => {
        it('should work with non-null dates', () => {
            assert.equal(YearMonth.nbMonthsBetween(new YearMonth('2021-02'), new YearMonth('2021-02')), 0);
            assert.equal(YearMonth.nbMonthsBetween(new YearMonth('2020-12'), new YearMonth('2021-12')), 12);
            assert.equal(YearMonth.nbMonthsBetween(new YearMonth('2021-12'), new YearMonth('2021-01')), -11);
            assert.equal(YearMonth.nbMonthsBetween(new YearMonth('2020-12'), new YearMonth('2021-01')), 1);
        });
    });

    describe('#toString()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new YearMonth('2021-02').toString(), '2021-02');
            assert.equal(new YearMonth('2021-09').toString(), '2021-09');
            assert.equal(new YearMonth('2020-10').toString(), '2020-10');
            assert.equal(new YearMonth('2020-12').toString(), '2020-12');
        });
    });

    describe('#nbDaysInMonth()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new YearMonth('2021-01').nbDaysInMonth(), 31);
            assert.equal(new YearMonth('2021-02').nbDaysInMonth(), 28);
            assert.equal(new YearMonth('2021-03').nbDaysInMonth(), 31);
            assert.equal(new YearMonth('2021-04').nbDaysInMonth(), 30);
            assert.equal(new YearMonth('2021-05').nbDaysInMonth(), 31);
            assert.equal(new YearMonth('2021-06').nbDaysInMonth(), 30);
            assert.equal(new YearMonth('2021-07').nbDaysInMonth(), 31);
            assert.equal(new YearMonth('2021-08').nbDaysInMonth(), 31);
            assert.equal(new YearMonth('2021-09').nbDaysInMonth(), 30);
            assert.equal(new YearMonth('2021-10').nbDaysInMonth(), 31);
            assert.equal(new YearMonth('2021-11').nbDaysInMonth(), 30);
            assert.equal(new YearMonth('2021-12').nbDaysInMonth(), 31);
            assert.equal(new YearMonth('2000-02').nbDaysInMonth(), 29);
        });
    });

    describe('#atDay()', () => {
        it('should work with non-null day', () => {
            assert.equal(new YearMonth('2021-05').atDay(11).toString(), '2021-05-11');
        });
    });

    describe('#nbYearsUntil()', () => {
        it('should work with non-null day', () => {
            assert.equal(new YearMonth('2021-05').nbYearsUntil(new YearMonth('2021-05')), 0);
            assert.equal(new YearMonth('2020-05').nbYearsUntil(new YearMonth('2021-05')), 1);
            assert.equal(new YearMonth('2021-05').nbYearsUntil(new YearMonth('2020-05')), -1);
            assert.equal(new YearMonth('2021-01').nbYearsUntil(new YearMonth('2021-07')), 0.5);
        });
    });

    describe('#nextMonth()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new YearMonth('2021-05').nextMonth().toString(), '2021-06');
            assert.equal(new YearMonth('2021-11').nextMonth().toString(), '2021-12');
            assert.equal(new YearMonth('2021-12').nextMonth().toString(), '2022-01');
        });
    });
});
