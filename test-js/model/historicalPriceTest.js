import {HistoricalPrice} from '../../js/model/HistoricalPrice.js'
import {YearMonth} from '../../js/model/YearMonth.js'
import {LocalDate} from '../../js/model/LocalDate.js'

const assert = chai.assert;
const expect = chai.expect;

describe('HistoricalPrice', () => {
    describe('#findAllEveryMonthBetween()', () => {
        it('should work empty array', () => {
            const mhPrices = HistoricalPrice.findAllEveryMonthBetween(
                [], YearMonth.parseString('2020-01'), YearMonth.parseString('2020-02'));
            assert.equal(mhPrices.length, 0);
        });

        it('should work with start and end dates out of range', () => {
            const mhPrices = HistoricalPrice.findAllEveryMonthBetween([
                new HistoricalPrice(LocalDate.parseString('2021-04-10'), 410),
                new HistoricalPrice(LocalDate.parseString('2021-04-15'), 415),
                new HistoricalPrice(LocalDate.parseString('2021-05-02'), 502),
            ], YearMonth.parseString('2020-01'), YearMonth.parseString('2020-02'));
            assert.equal(mhPrices.length, 0);
        });

        it('should work with sub-range of dates', () => {
            const mhPrices = HistoricalPrice.findAllEveryMonthBetween([
                new HistoricalPrice(LocalDate.parseString('2021-01-01'), 101),
                new HistoricalPrice(LocalDate.parseString('2021-02-01'), 201),
                new HistoricalPrice(LocalDate.parseString('2021-02-05'), 205),
                new HistoricalPrice(LocalDate.parseString('2021-02-28'), 228),
                new HistoricalPrice(LocalDate.parseString('2021-03-20'), 320),
                new HistoricalPrice(LocalDate.parseString('2021-04-30'), 430),
                new HistoricalPrice(LocalDate.parseString('2021-05-03'), 503),
                new HistoricalPrice(LocalDate.parseString('2021-06-03'), 603),
                new HistoricalPrice(LocalDate.parseString('2021-06-28'), 628),
                new HistoricalPrice(LocalDate.parseString('2021-07-02'), 702),
                new HistoricalPrice(LocalDate.parseString('2021-08-01'), 801),
                new HistoricalPrice(LocalDate.parseString('2021-08-31'), 831),
                new HistoricalPrice(LocalDate.parseString('2021-09-20'), 920),
            ], YearMonth.parseString('2021-02'), YearMonth.parseString('2021-09'));
            assert.equal(mhPrices.length, 8);
            assert.equal(mhPrices[0].historicalPrice.priceInUsd, 201);
            assert.equal(mhPrices[1].historicalPrice.priceInUsd, 228);
            assert.equal(mhPrices[2].historicalPrice.priceInUsd, 320);
            assert.equal(mhPrices[3].historicalPrice.priceInUsd, 430);
            assert.equal(mhPrices[4].historicalPrice.priceInUsd, 603);
            assert.equal(mhPrices[5].historicalPrice.priceInUsd, 702);
            assert.equal(mhPrices[6].historicalPrice.priceInUsd, 801);
            assert.equal(mhPrices[7].historicalPrice.priceInUsd, 831);
        });

        it('should work with a larger range of dates', () => {
            const mhPrices = HistoricalPrice.findAllEveryMonthBetween([
                new HistoricalPrice(LocalDate.parseString('2021-04-01'), 401),
                new HistoricalPrice(LocalDate.parseString('2021-05-01'), 501),
                new HistoricalPrice(LocalDate.parseString('2021-06-01'), 601),
            ], YearMonth.parseString('2021-01'), YearMonth.parseString('2021-12'));
            assert.equal(mhPrices.length, 3);
            assert.equal(mhPrices[0].historicalPrice.priceInUsd, 401);
            assert.equal(mhPrices[1].historicalPrice.priceInUsd, 501);
            assert.equal(mhPrices[2].historicalPrice.priceInUsd, 601);
        });

        it('should work with unordered historical prices', () => {
            const mhPrices = HistoricalPrice.findAllEveryMonthBetween([
                new HistoricalPrice(LocalDate.parseString('2021-05-01'), 501),
                new HistoricalPrice(LocalDate.parseString('2021-04-01'), 401),
                new HistoricalPrice(LocalDate.parseString('2021-06-01'), 601),
            ], YearMonth.parseString('2021-04'), YearMonth.parseString('2021-06'));
            assert.equal(mhPrices.length, 3);
            assert.equal(mhPrices[0].historicalPrice.priceInUsd, 401);
            assert.equal(mhPrices[1].historicalPrice.priceInUsd, 501);
            assert.equal(mhPrices[2].historicalPrice.priceInUsd, 601);
        });
    });
});
