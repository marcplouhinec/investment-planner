import {Scope} from "./Scope.js";
import {PortfolioInvestment} from "./PortfolioInvestment.js";
import {Asset} from "./Asset.js";

class SimulationConfig {

    /**
     * @param {Scope} scope
     * @param {PortfolioInvestment[]} portfolioInvestments
     * @param {Asset[]} assets
     */
    constructor(scope, portfolioInvestments, assets) {
        /** @type {Scope} */
        this.scope = scope;
        /** @type {PortfolioInvestment[]} */
        this.portfolioInvestments = portfolioInvestments;
        /** @type {Asset[]} */
        this.assets = assets;
    }

    /**
     * @param {{
     *     scope: Scope,
     *     portfolioInvestments: PortfolioInvestment[],
     *     assets: Asset[]
     * }=} properties
     * @return {SimulationConfig}
     */
    static parseProperties(properties) {
        const sanitizedProperties = properties || {};

        const scope = Scope.parseProperties(sanitizedProperties.scope);

        const portfolioInvestments = !sanitizedProperties.portfolioInvestments ? [] :
            sanitizedProperties.portfolioInvestments.map(it => PortfolioInvestment.parseProperties(it));

        const assets = !sanitizedProperties.assets ? [] :
            sanitizedProperties.assets.map(it => Asset.parseProperties(it));

        return new SimulationConfig(scope, portfolioInvestments, assets);
    }

}

export {SimulationConfig};