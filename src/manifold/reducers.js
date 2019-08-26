import {handleActions} from 'redux-actions';
import reduceReducers from 'reduce-reducers';
import keplerGlReducer from 'kepler.gl/reducers';
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
  LOAD_LOCAL_DATA_FAILURE,
  UPDATE_FEATURE_TYPES,
  UPDATE_SELECTED_INSTANCES,
  UPDATE_SELECTED_MODELS,
  UPDATE_N_CLUSTERS,
  UPDATE_METRIC,
  UPDATE_SEGMENTATION_METHOD,
  UPDATE_SEGMENT_FILTERS,
  UPDATE_BASE_MODELS,
  UPDATE_SEGMENT_GROUPS,
  UPDATE_DISPLAY_GEO_FEATURES,
  UPDATE_COLOR_BY_FEATURE,
} from './actions';
import {DEFAULT_FEATURE_TYPES} from './constants';
import {getDefaultSegmentGroups, registerExternalReducers} from './utils';

export const DEFAULT_STATE = {
  // TODO: these are fields used with Python backend. Consider consolidate/remove
  metaData: undefined,
  models: undefined,
  features: undefined,

  // data and metadata
  // columns: array of array of columns; fields: array of field metadata
  data: {columns: [], fields: []},
  // collumnTypeRanges: map from "column type" (x, yPred, etc) to array of 2 elements indicating the start and end index of that column type in dataset
  columnRangeType: {
    x: [],
    yPred: [],
    yTrue: [],
    score: [],
  },
  modelsMeta: {},
  isBackendDataLoading: false,
  isModelsComparisonLoading: false,
  isFeaturesDistributionLoading: false,
  isDataLoadingError: null,

  // display states
  featureTypes: DEFAULT_FEATURE_TYPES,
  selectedInstances: [],
  divergenceThreshold: 0,
  selectedModelMap: {},
  // todo: consider changing feature from id to feature def
  displayGeoFeatures: [0],
  colorByFeature: 0,

  // data manipulation states
  nClusters: 4,
  metric: 'performance',
  segmentFilters: undefined,
  baseModels: [],
  segmentGroups: [[2, 3], [0, 1]],
  // TODO change to segmentationMode: [K-Means, Manual-Performance, Manual-Feature]
  isManualSegmentation: false,

  // external states
  keplerGl: {map: {}},
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

// -- local data source -- //
const handleLoadLocalDataStart = (state, {payload}) => ({
  ...state,
  isLocalDataLoading: true,
  dataLoadingFailure: null,
});

const handleLoadLocalDataSuccess = (state, {payload}) => {
  const {data, modelsMeta, columnTypeRanges} = payload;
  return {
    ...state,
    data,
    modelsMeta,
    columnTypeRanges,
    isLocalDataLoading: false,
  };
};

const handleLoadLocalDataFailure = (state, {payload}) => ({
  ...state,
  isLocalDataLoading: false,
  dataLoadingError: payload,
});

export const handleUpdateFeatureTypes = (state, {payload}) => {
  return {
    ...state,
    featureTypes: {
      ...state.featureTypes,
      ...payload,
    },
  };
};

// -- UI actions -- //
const handleUpdateSelectedInstances = (state, {payload}) => ({
  ...state,
  selectedInstances: payload.map(d => d.object),
});

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

const handleUpdateDisplayGeoFeatures = (state, {payload}) => {
  return {
    ...state,
    displayGeoFeatures: [payload],
  };
};

const handleUpdateColorByFeature = (state, {payload}) => {
  return {
    ...state,
    colorByFeature: payload,
  };
};

const manifoldReducer = handleActions(
  {
    [FETCH_MODELS_START]: handleFetchModelsStart,
    [FETCH_MODELS_SUCCESS]: handleFetchModelsSuccess,
    [FETCH_BACKEND_DATA_START]: handleFetchBackendDataStart,
    [FETCH_BACKEND_DATA_SUCCESS]: handleFetchBackendDataSuccess,
    [FETCH_FEATURES_START]: handleFetchFeaturesStart,
    [FETCH_FEATURES_SUCCESS]: handleFetchFeaturesSuccess,
    [LOAD_LOCAL_DATA_START]: handleLoadLocalDataStart,
    [LOAD_LOCAL_DATA_SUCCESS]: handleLoadLocalDataSuccess,
    [LOAD_LOCAL_DATA_FAILURE]: handleLoadLocalDataFailure,
    [UPDATE_FEATURE_TYPES]: handleUpdateFeatureTypes,
    [UPDATE_SELECTED_INSTANCES]: handleUpdateSelectedInstances,
    [UPDATE_DIVERGENCE_THRESHOLD]: handleUpdateDivergenceThreshold,
    [UPDATE_SELECTED_MODELS]: handleUpdateSelectModels,
    [UPDATE_N_CLUSTERS]: handleUpdateNClusters,
    [UPDATE_METRIC]: handleUpdateMetric,
    [UPDATE_SEGMENTATION_METHOD]: handleUpdateSegmentationMethod,
    [UPDATE_SEGMENT_FILTERS]: handleUpdateSegmentFilters,
    [UPDATE_BASE_MODELS]: handleUpdateBaseModels,
    [UPDATE_SEGMENT_GROUPS]: handleUpdateSegmentGroups,
    [UPDATE_DISPLAY_GEO_FEATURES]: handleUpdateDisplayGeoFeatures,
    [UPDATE_COLOR_BY_FEATURE]: handleUpdateColorByFeature,
  },
  DEFAULT_STATE
);

/*
Mount keplerGl state as a sub state within manifold state
final redux state:
{
  app: ...
  manifold: {
    ... // other manifold states
    keplerGl: ...
  }
}
Reference: https://github.com/keplergl/kepler.gl/blob/master/docs/api-reference/reducers/reducers.md
*/

const externalreducers = registerExternalReducers({
  keplerGl: keplerGlReducer.initialState({
    uiState: {
      readOnly: true,
      currentModal: null,
    },
    mapStyle: {
      styleType: 'light',
    },
  }),
});

export default reduceReducers(DEFAULT_STATE, manifoldReducer, externalreducers);
