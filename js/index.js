import {simulationConfigService} from './service/simulationConfigService.js';
import {simulationConfigController} from './facade/controller/simulationConfigController.js';
import {portfolioAllocationController} from './facade/controller/portfolioAllocationController.js';
import {portfolioSimulationController} from './facade/controller/portfolioSimulationController.js';

simulationConfigService.init();
simulationConfigController.init();
portfolioAllocationController.init();
portfolioSimulationController.init();