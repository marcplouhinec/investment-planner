import {Scope} from "./Scope.js";
import {PortfolioInvestment} from "./PortfolioInvestment.js";

class SimulationConfig {

    /**
     * @param {{
     *     scope: Scope,
     *     portfolioInvestments: PortfolioInvestment[]
     * }=} properties
     */
    constructor(properties) {
        const sanitizedProperties = properties || {};

        /** @type {Scope} */
        this.scope = new Scope(sanitizedProperties.scope);
        /** @type {PortfolioInvestment[]} */
        this.portfolioInvestments = !sanitizedProperties.portfolioInvestments ? [] :
            sanitizedProperties.portfolioInvestments.map(it => new PortfolioInvestment(it));
    }

}

export {SimulationConfig};