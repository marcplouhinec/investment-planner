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

    describe('#toString()', () => {
        it('should work with non-null dates', () => {
            assert.equal(new LocalDate('2021-02-01').toString(), '2021-02-01');
            assert.equal(new LocalDate('2021-09-15').toString(), '2021-09-15');
            assert.equal(new LocalDate('2020-10-30').toString(), '2020-10-30');
            assert.equal(new LocalDate('2020-12-31').toString(), '2020-12-31');
        });
    });
});
