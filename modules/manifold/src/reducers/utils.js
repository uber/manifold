import {validateAndSetDefaultStatesConfigurator} from '../utils';
import {setDefaultFuncs, isValidFuncs} from '../utils/default-states';

export const validateAndSetDefaultStates = validateAndSetDefaultStatesConfigurator(
  ['metric', 'baseCols', 'nClusters', 'segmentFilters', 'segmentGroups'],
  isValidFuncs,
  setDefaultFuncs
);
