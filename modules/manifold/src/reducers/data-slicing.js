import {validateAndSetDefaultStates} from './utils';
import {SEGMENTATION_METHOD} from '../constants';

export const handleUpdateSegmentationMethod = (state, {payload}) => {
  const isManualSegmentation = payload === SEGMENTATION_METHOD.MANUAL;
  return validateAndSetDefaultStates({
    ...state,
    isManualSegmentation,
  });
};

export const handleUpdateBaseCols = (state, {payload}) => {
  return validateAndSetDefaultStates({
    ...state,
    baseCols: payload,
  });
};

export const handleUpdateNClusters = (state, {payload}) => {
  const delta = payload === 'INC' ? 1 : payload === 'DEC' ? -1 : 0;
  return validateAndSetDefaultStates({
    ...state,
    nClusters: state.nClusters + delta,
  });
};

export const handleUpdateSegmentFilters = (state, {payload}) => {
  return validateAndSetDefaultStates({
    ...state,
    segmentFilters: payload,
  });
};

export const handleUpdateSegmentGroups = (state, {payload}) => {
  return validateAndSetDefaultStates({
    ...state,
    segmentGroups: payload,
  });
};
