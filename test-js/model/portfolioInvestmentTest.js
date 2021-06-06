import {PortfolioInvestment} from '../../js/model/PortfolioInvestment.js'
import {YearMonth} from '../../js/model/YearMonth.js'

const assert = chai.assert;

describe('PortfolioInvestment', () => {

    describe('#findStartYearMonth()', () => {
        it('should work with multiple investments', () => {
            const investments = [
                new PortfolioInvestment({phase1StartYearMonth: '2021-02'}),
                new PortfolioInvestment({phase1StartYearMonth: '2021-05'}),
                new PortfolioInvestment({phase1StartYearMonth: '2020-12'}),
                new PortfolioInvestment({phase1StartYearMonth: '2020-10'}),
            ];

            const yearMonth = PortfolioInvestment.findStartYearMonth(investments);

            assert.equal(yearMonth.year, 2020);
            assert.equal(yearMonth.month, 10);
        });
    });

    describe('#findEndYearMonth()', () => {
        it('should work with multiple investments', () => {
            const investments = [
                new PortfolioInvestment({phase3EndYearMonth: '2021-02'}),
                new PortfolioInvestment({phase3EndYearMonth: '2021-05'}),
                new PortfolioInvestment({phase3EndYearMonth: '2020-12'}),
                new PortfolioInvestment({phase3EndYearMonth: '2020-10'}),
            ];

            const yearMonth = PortfolioInvestment.findEndYearMonth(investments);

            assert.equal(yearMonth.year, 2021);
            assert.equal(yearMonth.month, 5);
        });
    });

    describe('#computeWeightAt()', () => {
        it('should return null outside of scope', () => {
            const investment = new PortfolioInvestment({
                assetCode: "FUND_001",
                phase1StartYearMonth: "2021-07",
                phase1InitialWeight: 60,
                phase1FinalWeight: 55,
                phase2StartYearMonth: "2035-01",
                phase2FinalWeight: 20,
                phase3StartYearMonth: "2035-01",
                phase3FinalWeight: 20,
                phase3EndYearMonth: "2065-01",
                enabled: true
            });

            assert.equal(investment.computeWeightAt(new YearMonth('1980-01')), null);
            assert.equal(investment.computeWeightAt(new YearMonth('2021-06')), null);
            assert.equal(investment.computeWeightAt(new YearMonth('2065-02')), null);
        });

        it('should work at phase changing date', () => {
            const investment = new PortfolioInvestment({
                assetCode: "FUND_001",
                phase1StartYearMonth: "2021-07",
                phase1InitialWeight: 60,
                phase1FinalWeight: 55,
                phase2StartYearMonth: "2035-01",
                phase2FinalWeight: 20,
                phase3StartYearMonth: "2050-01",
                phase3FinalWeight: 15,
                phase3EndYearMonth: "2065-01",
                enabled: true
            });

            assert.equal(investment.computeWeightAt(new YearMonth('2021-07')), 60);
            assert.equal(investment.computeWeightAt(new YearMonth('2035-01')), 55);
            assert.equal(investment.computeWeightAt(new YearMonth('2050-01')), 20);
            assert.equal(investment.computeWeightAt(new YearMonth('2065-01')), 15);
        });

        it('should work between phase changing date', () => {
            const investment = new PortfolioInvestment({
                assetCode: "FUND_001",
                phase1StartYearMonth: "2020-01",
                phase1InitialWeight: 100,
                phase1FinalWeight: 50,
                phase2StartYearMonth: "2021-01",
                phase2FinalWeight: 20,
                phase3StartYearMonth: "2051-01",
                phase3FinalWeight: 10,
                phase3EndYearMonth: "2061-01",
                enabled: true
            });

            assert.equal(investment.computeWeightAt(new YearMonth('2020-07')), 75);
            assert.equal(investment.computeWeightAt(new YearMonth('2036-01')), 35);
            assert.equal(investment.computeWeightAt(new YearMonth('2056-01')), 15);
        });
    });
});
