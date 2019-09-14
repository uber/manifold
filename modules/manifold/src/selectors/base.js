import {createSelector} from 'reselect';
import {Array} from 'global';
import get from 'lodash.get';

// selector  dependencies:
// having BE: base -> compute -> data -> adaptor -> UI components
// not having BE: base -> data -> adaptor -> UI components

// ---------------------------------------------------------------------------- //
// -- THE BASE SELECTORS SHOULD CONTAIN STATE SELECTORS FROM THE REDUCER -- //
// ---------------------------------------------------------------------------- //

export const rootSelector = state => state;
export const getHasBackend = state =>
  Boolean(get(state, ['_env', 'hasBackend']));

export const getModelsComparisonParams = createSelector(
  rootSelector,
  (state = {}) => {
    const {nClusters, metric, baseCols, segmentFilters} = state;
    return {
      nClusters,
      metric,
      baseCols,
      segmentFilters,
    };
  }
);
export const getFeatureDistributionParams = createSelector(
  rootSelector,
  (state = {}) => {
    const {nClusters, segmentGroups} = state;
    return {
      nClusters,
      segmentGroups,
    };
  }
);

export const getIsLocalDataLoading = createSelector(
  rootSelector,
  state => state.isLocalDataLoading
);
export const getIsModelsComparisonLoading = createSelector(
  rootSelector,
  state => state.isModelsComparisonLoading
);
export const getIsFeaturesDistributionLoading = createSelector(
  rootSelector,
  state => state.isFeaturesDistributionLoading
);

export const getMetric = createSelector(
  rootSelector,
  state => state.metric
);
export const getBaseCols = createSelector(
  rootSelector,
  state => state.baseCols
);
export const getNClusters = createSelector(
  rootSelector,
  state => state.nClusters
);
export const getSegmentFilters = createSelector(
  rootSelector,
  state => state.segmentFilters
);
export const getSegmentGroups = createSelector(
  rootSelector,
  state => state.segmentGroups
);
export const getDivergenceThreshold = createSelector(
  rootSelector,
  state => state.divergenceThreshold
);
export const getSelectedModels = createSelector(
  rootSelector,
  state => state.selectedModelMap
);

export const getSelectedInstances = createSelector(
  rootSelector,
  state => state.selectedInstances
);

export const getIsManualSegmentation = createSelector(
  rootSelector,
  (state = {}) => state.isManualSegmentation
);

export const getDisplayGeoFeatures = createSelector(
  rootSelector,
  (state = {}) => state.displayGeoFeatures
);

export const getColorByFeature = createSelector(
  rootSelector,
  state => state.colorByFeature
);
