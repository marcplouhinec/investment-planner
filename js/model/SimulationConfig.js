import {Scope} from "./Scope.js";
import {PortfolioInvestment} from "./PortfolioInvestment.js";
import {Asset} from "./Asset.js";

class SimulationConfig {

    /**
     * @param {{
     *     scope: Scope,
     *     portfolioInvestments: PortfolioInvestment[],
     *     assets: Asset[]
     * }=} properties
     */
    constructor(properties) {
        const sanitizedProperties = properties || {};

        /** @type {Scope} */
        this.scope = new Scope(sanitizedProperties.scope);
        /** @type {PortfolioInvestment[]} */
        this.portfolioInvestments = !sanitizedProperties.portfolioInvestments ? [] :
            sanitizedProperties.portfolioInvestments.map(it => new PortfolioInvestment(it));
        /** @type {Asset[]} */
        this.assets = !sanitizedProperties.assets ? [] :
            sanitizedProperties.assets.map(it => new Asset(it));
    }

}

export {SimulationConfig};