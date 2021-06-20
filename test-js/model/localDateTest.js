import {LocalDate} from '../../js/model/LocalDate.js'

const assert = chai.assert;
const expect = chai.expect;

describe('LocalDate', () => {
    describe('#constructor()', () => {
        it('should parse string', () => {
            const localDate = LocalDate.parseString('2021-06-12');
            assert.equal(localDate.year, 2021);
            assert.equal(localDate.month, 6);
            assert.equal(localDate.day, 12);
        });

        it('should parse object', () => {
            const localDate = LocalDate.parseProperties({
                year: 2020,
                month: 5,
                day: 25
            });
            assert.equal(localDate.year, 2020);
            assert.equal(localDate.month, 5);
            assert.equal(localDate.day, 25);
        });

        it('should parse null', () => {
            const localDate = LocalDate.parseProperties(null);
            assert.equal(localDate.year, 0);
            assert.equal(localDate.month, 0);
            assert.equal(localDate.day, 0);
        });

        it('should parse blank string', () => {
            const localDate = LocalDate.parseString(' \t \n ');
            assert.equal(localDate.year, 0);
            assert.equal(localDate.month, 0);
            assert.equal(localDate.day, 0);
        });

        it('should fail on invalid string', () => {
            expect(() => {
                LocalDate.parseString('202-01-A')
            }).to.throw("The value '202-01-A' is not a valid LocalDate. The correct syntax is 'YYYY-MM-DD'.");
        });
    });

    describe('#isBefore()', () => {
        it('should work with non-null dates', () => {
            assert.equal(LocalDate.parseString('2021-02-01').isBefore(LocalDate.parseString('2021-05-01')), true);
            assert.equal(LocalDate.parseString('2020-12-01').isBefore(LocalDate.parseString('2021-05-01')), true);
            assert.equal(LocalDate.parseString('2020-12-01').isBefore(LocalDate.parseString('2020-12-06')), true);
            assert.equal(LocalDate.parseString('2020-12-01').isBefore(LocalDate.parseString('2020-10-01')), false);
            assert.equal(LocalDate.parseString('2021-10-01').isBefore(LocalDate.parseString('2020-10-01')), false);
            assert.equal(LocalDate.parseString('2021-10-25').isBefore(LocalDate.parseString('2021-10-01')), false);
        });
    });

    describe('#isAfter()', () => {
        it('should work with non-null dates', () => {
            assert.equal(LocalDate.parseString('2021-02-01').isAfter(LocalDate.parseString('2021-05-01')), false);
            assert.equal(LocalDate.parseString('2020-12-01').isAfter(LocalDate.parseString('2021-05-01')), false);
            assert.equal(LocalDate.parseString('2020-12-01').isAfter(LocalDate.parseString('2020-12-06')), false);
            assert.equal(LocalDate.parseString('2020-12-01').isAfter(LocalDate.parseString('2020-10-01')), true);
            assert.equal(LocalDate.parseString('2021-10-01').isAfter(LocalDate.parseString('2020-10-01')), true);
            assert.equal(LocalDate.parseString('2021-10-25').isAfter(LocalDate.parseString('2021-10-01')), true);
        });
    });

    describe('#equals()', () => {
        it('should work with non-null dates', () => {
            assert.equal(LocalDate.parseString('2021-02-01').equals(LocalDate.parseString('2021-02-01')), true);
            assert.equal(LocalDate.parseString('2021-02-01').equals(LocalDate.parseString('2021-02-25')), false);
            assert.equal(LocalDate.parseString('2021-02-01').equals(LocalDate.parseString('2021-07-01')), false);
            assert.equal(LocalDate.parseString('2021-02-01').equals(LocalDate.parseString('2019-02-01')), false);
        });
    });

    describe('#toString()', () => {
        it('should work with non-null dates', () => {
            assert.equal(LocalDate.parseString('2021-02-01').toString(), '2021-02-01');
            assert.equal(LocalDate.parseString('2021-09-15').toString(), '2021-09-15');
            assert.equal(LocalDate.parseString('2020-10-30').toString(), '2020-10-30');
            assert.equal(LocalDate.parseString('2020-12-31').toString(), '2020-12-31');
        });
    });

    describe('#nbDaysUntil()', () => {
        it('should work with non-null dates', () => {
            assert.equal(
                LocalDate.parseString('2021-02-01').nbDaysUntil(LocalDate.parseString('2021-02-01')),
                0);
            assert.equal(
                LocalDate.parseString('2021-02-01').nbDaysUntil(LocalDate.parseString('2021-02-02')),
                1);
            assert.equal(
                LocalDate.parseString('2021-02-02').nbDaysUntil(LocalDate.parseString('2021-02-01')),
                -1);
            assert.equal(
                LocalDate.parseString('2021-02-01').nbDaysUntil(LocalDate.parseString('2021-02-21')),
                20);
            assert.equal(
                LocalDate.parseString('2021-02-01').nbDaysUntil(LocalDate.parseString('2021-03-01')),
                28);
            assert.equal(
                LocalDate.parseString('2021-01-01').nbDaysUntil(LocalDate.parseString('2021-03-20')),
                31 + 28 + 19);
            assert.equal(
                LocalDate.parseString('2020-01-01').nbDaysUntil(LocalDate.parseString('2021-01-01')),
                366);
            assert.equal(
                LocalDate.parseString('2019-01-01').nbDaysUntil(LocalDate.parseString('2021-02-10')),
                365 * 2 + 31 + 10);
        });
    });

    describe('#nbYearsUntil()', () => {
        it('should work with non-null dates', () => {
            assert.equal(
                LocalDate.parseString('2021-02-01').nbYearsUntil(LocalDate.parseString('2021-02-01')),
                0);
            assert.equal(
                LocalDate.parseString('2021-02-01').nbYearsUntil(LocalDate.parseString('2022-02-01')),
                1);
            assert.equal(
                LocalDate.parseString('2020-01-01').nbYearsUntil(LocalDate.parseString('2019-01-01')),
                -1);
            assert.equal(
                LocalDate.parseString('2021-02-01').nbYearsUntil(LocalDate.parseString('2023-02-01')),
                2);
        });
    });

    describe('#findClosestAvailableLocalDate()', () => {
        it('should work with non-null dates', () => {
            const availableLocalDates = [
                LocalDate.parseString('2021-01-31'),
                LocalDate.parseString('2021-02-28'),
                LocalDate.parseString('2021-03-31'),
                LocalDate.parseString('2021-04-30'),
                LocalDate.parseString('2021-05-15'),
                LocalDate.parseString('2021-05-16'),
                LocalDate.parseString('2021-05-18'),
            ];
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('2021-02-28')).toString(),
                '2021-02-28');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('2021-02-20')).toString(),
                '2021-02-28');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('2021-03-01')).toString(),
                '2021-02-28');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('1999-01-01')).toString(),
                '2021-01-31');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('2021-06-13')).toString(),
                '2021-05-18');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('2021-05-17')).toString(),
                '2021-05-16');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('2021-05-05')).toString(),
                '2021-04-30');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, LocalDate.parseString('2021-05-15')).toString(),
                '2021-05-15');
        });
    });

    describe('#toClosestYearMonth()', () => {
        it('should work with non-null dates', () => {
            assert.equal(LocalDate.parseString('2021-02-01').toClosestYearMonth().toString(), '2021-02');
            assert.equal(LocalDate.parseString('2021-02-10').toClosestYearMonth().toString(), '2021-02');
            assert.equal(LocalDate.parseString('2021-02-14').toClosestYearMonth().toString(), '2021-02');
            assert.equal(LocalDate.parseString('2021-02-15').toClosestYearMonth().toString(), '2021-03');
            assert.equal(LocalDate.parseString('2021-02-16').toClosestYearMonth().toString(), '2021-03');
            assert.equal(LocalDate.parseString('2021-02-28').toClosestYearMonth().toString(), '2021-03');
            assert.equal(LocalDate.parseString('2021-12-05').toClosestYearMonth().toString(), '2021-12');
            assert.equal(LocalDate.parseString('2021-12-30').toClosestYearMonth().toString(), '2022-01');
        });
    });

    describe('#compareAsc()', () => {
        it('should work with multiple dates', () => {
            const dates = [
                LocalDate.parseString('2021-05-14'),
                LocalDate.parseString('2021-05-12'),
                LocalDate.parseString('2021-04-28'),
                LocalDate.parseString('2021-06-28'),
                LocalDate.parseString('2020-10-01'),
            ];

            const sortedDates = dates.sort(LocalDate.compareAsc);

            assert.equal(sortedDates.length, 5);
            assert.equal(sortedDates[0].toString(), '2020-10-01');
            assert.equal(sortedDates[1].toString(), '2021-04-28');
            assert.equal(sortedDates[2].toString(), '2021-05-12');
            assert.equal(sortedDates[3].toString(), '2021-05-14');
            assert.equal(sortedDates[4].toString(), '2021-06-28');
        });
    });
});
