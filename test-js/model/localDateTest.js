import {LocalDate} from '../../js/model/LocalDate.js'

const assert = chai.assert;
const expect = chai.expect;

describe('LocalDate', () => {
    describe('#constructor()', () => {
        it('should parse string', () => {
            const localDate = new LocalDate('2021-06-12');
            assert.equal(localDate.year, 2021);
            assert.equal(localDate.month, 6);
            assert.equal(localDate.day, 12);
        });

        it('should parse object', () => {
            const localDate = new LocalDate({
                year: 2020,
                month: 5,
                day: 25
            });
            assert.equal(localDate.year, 2020);
            assert.equal(localDate.month, 5);
            assert.equal(localDate.day, 25);
        });

        it('should parse null', () => {
            const localDate = new LocalDate(null);
            assert.equal(localDate.year, 0);
            assert.equal(localDate.month, 0);
            assert.equal(localDate.day, 0);
        });

        it('should parse blank string', () => {
            const localDate = new LocalDate(' \t \n ');
            assert.equal(localDate.year, 0);
            assert.equal(localDate.month, 0);
            assert.equal(localDate.day, 0);
        });

        it('should fail on invalid string', () => {
            expect(() => {
                new LocalDate('202-01-A')
            }).to.throw("The value '202-01-A' is not a valid LocalDate. The correct syntax is 'YYYY-MM-DD'.");
        });
    });

    describe('#equals()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new LocalDate('2021-02-01').equals(new LocalDate('2021-02-01')), true);
            assert.equal(new LocalDate('2021-02-01').equals(new LocalDate('2021-02-25')), false);
            assert.equal(new LocalDate('2021-02-01').equals(new LocalDate('2021-07-01')), false);
            assert.equal(new LocalDate('2021-02-01').equals(new LocalDate('2019-02-01')), false);
        });
    });

    describe('#toString()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new LocalDate('2021-02-01').toString(), '2021-02-01');
            assert.equal(new LocalDate('2021-09-15').toString(), '2021-09-15');
            assert.equal(new LocalDate('2020-10-30').toString(), '2020-10-30');
            assert.equal(new LocalDate('2020-12-31').toString(), '2020-12-31');
        });
    });

    describe('#nbDaysUntil()', () => {
        it('should work with non-null dates', () => {
            assert.equal(
                new LocalDate('2021-02-01').nbDaysUntil(new LocalDate('2021-02-01')),
                0);
            assert.equal(
                new LocalDate('2021-02-01').nbDaysUntil(new LocalDate('2021-02-02')),
                1);
            assert.equal(
                new LocalDate('2021-02-02').nbDaysUntil(new LocalDate('2021-02-01')),
                -1);
            assert.equal(
                new LocalDate('2021-02-01').nbDaysUntil(new LocalDate('2021-02-21')),
                20);
            assert.equal(
                new LocalDate('2021-02-01').nbDaysUntil(new LocalDate('2021-03-01')),
                28);
            assert.equal(
                new LocalDate('2021-01-01').nbDaysUntil(new LocalDate('2021-03-20')),
                31 + 28 + 19);
            assert.equal(
                new LocalDate('2020-01-01').nbDaysUntil(new LocalDate('2021-01-01')),
                366);
            assert.equal(
                new LocalDate('2019-01-01').nbDaysUntil(new LocalDate('2021-02-10')),
                365 * 2 + 31 + 10);
        });
    });

    describe('#nbYearsUntil()', () => {
        it('should work with non-null dates', () => {
            assert.equal(
                new LocalDate('2021-02-01').nbYearsUntil(new LocalDate('2021-02-01')),
                0);
            assert.equal(
                new LocalDate('2021-02-01').nbYearsUntil(new LocalDate('2022-02-01')),
                1);
            assert.equal(
                new LocalDate('2020-01-01').nbYearsUntil(new LocalDate('2019-01-01')),
                -1);
            assert.equal(
                new LocalDate('2021-02-01').nbYearsUntil(new LocalDate('2023-02-01')),
                2);
        });
    });

    describe('#findClosestAvailableLocalDate()', () => {
        it('should work with non-null dates', () => {
            const availableLocalDates = [
                new LocalDate('2021-01-31'),
                new LocalDate('2021-02-28'),
                new LocalDate('2021-03-31'),
                new LocalDate('2021-04-30'),
                new LocalDate('2021-05-15'),
                new LocalDate('2021-05-16'),
                new LocalDate('2021-05-18'),
            ];
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('2021-02-28')).toString(),
                '2021-02-28');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('2021-02-20')).toString(),
                '2021-02-28');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('2021-03-01')).toString(),
                '2021-02-28');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('1999-01-01')).toString(),
                '2021-01-31');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('2021-06-13')).toString(),
                '2021-05-18');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('2021-05-17')).toString(),
                '2021-05-16');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('2021-05-05')).toString(),
                '2021-04-30');
            assert.equal(
                LocalDate.findClosestAvailableLocalDate(
                    availableLocalDates, new LocalDate('2021-05-15')).toString(),
                '2021-05-15');
        });
    });
});
