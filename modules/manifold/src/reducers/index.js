import {handleActions} from 'redux-actions';
import reduceReducers from 'reduce-reducers';
import keplerGlReducer from 'kepler.gl/reducers';

import {handleUpdateMetric} from './data-generation';
import {
  handleUpdateSegmentationMethod,
  handleUpdateBaseCols,
  handleUpdateNClusters,
  handleUpdateSegmentFilters,
  handleUpdateSegmentGroups,
} from './data-slicing';

import {
  FETCH_MODELS_START,
  FETCH_MODELS_SUCCESS,
  FETCH_BACKEND_DATA_START,
  FETCH_BACKEND_DATA_SUCCESS,
  FETCH_FEATURES_START,
  FETCH_FEATURES_SUCCESS,
  LOAD_LOCAL_DATA_START,
  LOAD_LOCAL_DATA_SUCCESS,
  LOAD_LOCAL_DATA_FAILURE,
  UPDATE_SELECTED_INSTANCES,
  UPDATE_DIVERGENCE_THRESHOLD,
  UPDATE_SELECTED_MODELS,
  UPDATE_N_CLUSTERS,
  UPDATE_METRIC,
  UPDATE_SEGMENTATION_METHOD,
  UPDATE_SEGMENT_FILTERS,
  UPDATE_BASE_COLS,
  UPDATE_SEGMENT_GROUPS,
  UPDATE_DISPLAY_GEO_FEATURES,
  UPDATE_COLOR_BY_FEATURE,
} from '../actions';

import {METRIC} from '../constants';
import {registerExternalReducers} from '../utils';

export const DEFAULT_STATE = {
  // TODO: these are fields used with Python backend. Consider consolidate/remove
  metaData: undefined,
  models: undefined,
  features: undefined,

  /** data and metadata */
  // columns: array of array of columns; fields: array of field metadata
  data: {columns: [], fields: []},
  // map from "column type" (x, yPred, etc) to array of 2 elements indicating the start and end index of that column type in dataset
  columnRangeType: {
    x: [],
    yPred: [],
    yTrue: [],
    score: [],
  },
  modelsMeta: {
    // {Number} number of models
    nModels: undefined,
    // {Number} number of classes
    nClasses: undefined,
    // {Array<String>} an array of class names
    classLabels: [],
  },
  isDataLoadingError: false,

  /** data generation states */
  // {Object} metric configuration, contains {name, description, func}
  metric: METRIC.REGRESSION.ABSOLUTE_ERROR,

  /** data slicing states */
  isManualSegmentation: false,
  // {Array<Number>} use which columns to slice. An array of column ids
  baseCols: [],
  // {Array<Array<Object>>} filter logic corresponding to data segment (only applicable to manual slicing)
  segmentFilters: [],
  // {Number} number of clusters to use in automatic slicing (only applicable to automatic slicing)
  nClusters: 4,
  // {Array<Array<Number>>} which segments to group together for comparing against each other. An array of array of segment IDs
  segmentGroups: [[2, 3], [0, 1]],

  /** display states */
  selectedInstances: [],
  divergenceThreshold: 0,
  selectedModelMap: {},
  displayGeoFeatures: [0],
  colorByFeature: 0,

  /** external states */
  keplerGl: {map: {}},
};

// -- remote data source -- //
export const handleUpdateDivergenceThreshold = (state, {payload}) => ({
  ...state,
  divergenceThreshold: payload,
});

export const handleFetchBackendDataStart = (state, {payload}) => ({
  ...state,
  isBackendDataLoading: true,
});

export const handleFetchBackendDataSuccess = (state, {payload}) => {
  return {
    ...state,
    metaData: payload,
    isBackendDataLoading: false,
  };
};

export const handleFetchModelsStart = (state, {payload}) => ({
  ...state,
  isModelsComparisonLoading: true,
});

export const handleFetchModelsSuccess = (state, {payload}) => {
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

export const handleFetchFeaturesStart = (state, {payload}) => ({
  ...state,
  isFeaturesDistributionLoading: true,
});

export const handleFetchFeaturesSuccess = (state, {payload}) => ({
  ...state,
  features: payload,
  isFeaturesDistributionLoading: false,
});

// -- local data source -- //
export const handleLoadLocalDataStart = (state, {payload}) => ({
  ...state,
  isLocalDataLoading: true,
  dataLoadingFailure: null,
});

export const handleLoadLocalDataSuccess = (state, {payload}) => {
  const {data, modelsMeta, columnTypeRanges} = payload;
  return {
    ...state,
    data,
    modelsMeta,
    columnTypeRanges,
    isLocalDataLoading: false,
  };
};

export const handleLoadLocalDataFailure = (state, {payload}) => ({
  ...state,
  isLocalDataLoading: false,
  dataLoadingError: payload,
});

// -- UI actions -- //
export const handleUpdateSelectedInstances = (state, {payload}) => ({
  ...state,
  selectedInstances: payload.map(d => d.object),
});

export const handleUpdateSelectModels = (state, {payload}) => ({
  ...state,
  selectedModelMap: {
    ...state.selectedModelMap,
    [payload]: !state.selectedModelMap[payload],
  },
});

export const handleUpdateDisplayGeoFeatures = (state, {payload}) => {
  return {
    ...state,
    displayGeoFeatures: [payload],
  };
};

export const handleUpdateColorByFeature = (state, {payload}) => {
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
    [UPDATE_SELECTED_INSTANCES]: handleUpdateSelectedInstances,
    [UPDATE_DIVERGENCE_THRESHOLD]: handleUpdateDivergenceThreshold,
    [UPDATE_SELECTED_MODELS]: handleUpdateSelectModels,
    [UPDATE_N_CLUSTERS]: handleUpdateNClusters,
    [UPDATE_METRIC]: handleUpdateMetric,
    [UPDATE_SEGMENTATION_METHOD]: handleUpdateSegmentationMethod,
    [UPDATE_SEGMENT_FILTERS]: handleUpdateSegmentFilters,
    [UPDATE_BASE_COLS]: handleUpdateBaseCols,
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
