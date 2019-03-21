// @noflow
import {handleActions} from 'redux-actions';
import {
  UPDATE_DIVERGENCE_THRESHOLD,
  FETCH_BACKEND_DATA_START,
  FETCH_BACKEND_DATA_SUCCESS,
  FETCH_MODELS_START,
  FETCH_MODELS_SUCCESS,
  FETCH_FEATURES_START,
  FETCH_FEATURES_SUCCESS,
  LOAD_LOCAL_DATA_START,
  LOAD_LOCAL_DATA_SUCCESS,
  UPDATE_FEATURE_TYPES,
  UPDATE_SELECTED_MODELS,
  UPDATE_N_CLUSTERS,
  UPDATE_METRIC,
  UPDATE_SEGMENTATION_METHOD,
  UPDATE_SEGMENT_FILTERS,
  UPDATE_BASE_MODELS,
  UPDATE_SEGMENT_GROUPS,
} from './actions';
import {defaultFeatureTypes} from './constants';
import {getDefaultSegmentGroups} from './utils';

export const DEFAULT_STATE = {
  // TODO: these are fields used with Python backend. Consider consolidate/remove
  metaData: undefined,
  models: undefined,
  features: undefined,

  rawPredData: [],
  rawFeatureData: undefined,
  isBackendDataLoading: false,
  isModelsComparisonLoading: false,
  isFeaturesDistributionLoading: false,

  featureTypes: defaultFeatureTypes,
  divergenceThreshold: 0,
  selectedModelMap: {},

  // API params
  nClusters: 4,
  metric: 'performance',
  segmentFilters: undefined,
  baseModels: [],
  segmentGroups: [[3], [0, 1, 2]],
};

// -- remote data source -- //
const handleUpdateDivergenceThreshold = (state, {payload}) => ({
  ...state,
  divergenceThreshold: payload,
});

const handleFetchBackendDataStart = (state, {payload}) => ({
  ...state,
  isBackendDataLoading: true,
});

const handleFetchBackendDataSuccess = (state, {payload}) => {
  return {
    ...state,
    metaData: payload,
    isBackendDataLoading: false,
  };
};

const handleFetchModelsStart = (state, {payload}) => ({
  ...state,
  isModelsComparisonLoading: true,
});

const handleFetchModelsSuccess = (state, {payload}) => {
  const {modelsPerformance = []} = payload[0];
  const defaultSelectedModels = modelsPerformance.reduce((acc, d) => {
    acc[d.modelId] = false;
    return acc;
  }, {});
  return {
    ...state,
    models: payload,
    isModelsComparisonLoading: false,
    selectedModelMap: defaultSelectedModels,
  };
};

const handleFetchFeaturesStart = (state, {payload}) => ({
  ...state,
  isFeaturesDistributionLoading: true,
});

const handleFetchFeaturesSuccess = (state, {payload}) => ({
  ...state,
  features: payload,
  isFeaturesDistributionLoading: false,
});
// -- remote data source -- //

// -- local data source -- //
const handleLoadLocalDataStart = (state, {payload}) => ({
  ...state,
  isLocalDataLoading: true,
});

const handleLoadLocalDataSuccess = (state, {payload}) => {
  return {
    ...state,
    rawFeatureData: payload.featureData,
    rawPredData: payload.predData,
    isLocalDataLoading: false,
  };
};

export const handleUpdateFeatureTypes = (state, {payload}) => {
  return {
    ...state,
    featureTypes: {
      ...state.featureTypes,
      ...payload,
    },
  };
};
// -- local data source -- //

const handleUpdateSelectModels = (state, {payload}) => ({
  ...state,
  selectedModelMap: {
    ...state.selectedModelMap,
    [payload]: !state.selectedModelMap[payload],
  },
});

const handleUpdateNClusters = (state, {payload}) => {
  const delta = payload === 'INC' ? 1 : payload === 'DEC' ? -1 : 0;
  return {
    ...state,
    nClusters: state.nClusters + delta,
    segmentGroups: getDefaultSegmentGroups(state.nClusters + delta),
  };
};

const handleUpdateMetric = (state, {payload}) => ({
  ...state,
  metric: payload,
});

const handleUpdateSegmentationMethod = (state, {payload}) => ({
  ...state,
  isManualSegmentation: payload === 'manual',
});

const handleUpdateSegmentFilters = (state, {payload = []}) => {
  const {nClusters} = state;
  const newNClusters = payload && payload.length ? payload.length : nClusters;
  return {
    ...state,
    segmentFilters: payload,
    nClusters: newNClusters,
    segmentGroups: getDefaultSegmentGroups(newNClusters),
  };
};

const handleUpdateBaseModels = (state, {payload}) => ({
  ...state,
  baseModels: payload,
});

const handleUpdateSegmentGroups = (state, {payload}) => {
  return {
    ...state,
    segmentGroups: payload,
  };
};

export default handleActions(
  {
    [FETCH_MODELS_START]: handleFetchModelsStart,
    [FETCH_MODELS_SUCCESS]: handleFetchModelsSuccess,
    [FETCH_BACKEND_DATA_START]: handleFetchBackendDataStart,
    [FETCH_BACKEND_DATA_SUCCESS]: handleFetchBackendDataSuccess,
    [FETCH_FEATURES_START]: handleFetchFeaturesStart,
    [FETCH_FEATURES_SUCCESS]: handleFetchFeaturesSuccess,
    [LOAD_LOCAL_DATA_START]: handleLoadLocalDataStart,
    [LOAD_LOCAL_DATA_SUCCESS]: handleLoadLocalDataSuccess,
    [UPDATE_FEATURE_TYPES]: handleUpdateFeatureTypes,
    [UPDATE_DIVERGENCE_THRESHOLD]: handleUpdateDivergenceThreshold,
    [UPDATE_SELECTED_MODELS]: handleUpdateSelectModels,
    [UPDATE_N_CLUSTERS]: handleUpdateNClusters,
    [UPDATE_METRIC]: handleUpdateMetric,
    [UPDATE_SEGMENTATION_METHOD]: handleUpdateSegmentationMethod,
    [UPDATE_SEGMENT_FILTERS]: handleUpdateSegmentFilters,
    [UPDATE_BASE_MODELS]: handleUpdateBaseModels,
    [UPDATE_SEGMENT_GROUPS]: handleUpdateSegmentGroups,
  },
  DEFAULT_STATE
);
