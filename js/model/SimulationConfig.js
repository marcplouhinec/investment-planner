import {Scope} from "./Scope.js";

class SimulationConfig {

    /**
     * @param {{
     *     scope: Scope
     * }=} properties
     */
    constructor(properties) {
        const sanitizedProperties = properties || {};

        /** @type {Scope} */
        this.scope = new Scope(sanitizedProperties.scope);
    }

}

export {SimulationConfig};