import {Scope} from "./Scope.js";
import {PortfolioInvestment} from "./PortfolioInvestment.js";
import {Retirement} from "./Retirement.js";
import {Saving} from "./Saving.js";
import {Asset} from "./Asset.js";

class SimulationConfig {

    /**
     * @param {Scope} scope
     * @param {PortfolioInvestment[]} portfolioInvestments
     * @param {Retirement} retirement
     * @param {Saving[]} savings
     * @param {Asset[]} assets
     */
    constructor(scope, portfolioInvestments, retirement, savings, assets) {
        /** @type {Scope} */
        this.scope = scope;
        /** @type {PortfolioInvestment[]} */
        this.portfolioInvestments = portfolioInvestments;
        /** @type {Retirement} */
        this.retirement = retirement;
        /** @type {Saving[]} */
        this.savings = savings;
        /** @type {Asset[]} */
        this.assets = assets;
    }

    /**
     * @param {{
     *     scope: Scope|null,
     *     portfolioInvestments: PortfolioInvestment[]|null,
     *     retirement: Retirement|null,
     *     savings: Saving[]|null,
     *     assets: Asset[]|null
     * }|{}|null} properties
     * @return {SimulationConfig}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        const scope = Scope.parseProperties(sanitizedProperties.scope);

        const portfolioInvestments = !sanitizedProperties.portfolioInvestments ? [] :
            sanitizedProperties.portfolioInvestments.map(it => PortfolioInvestment.parseProperties(it));

        const retirement = Retirement.parseProperties(sanitizedProperties.retirement);

        const savings = !sanitizedProperties.savings ? [] :
            sanitizedProperties.savings.map(it => Saving.parseProperties(it));

        const assets = !sanitizedProperties.assets ? [] :
            sanitizedProperties.assets.map(it => Asset.parseProperties(it));

        return new SimulationConfig(scope, portfolioInvestments, retirement, savings, assets);
    }

}

export {SimulationConfig};