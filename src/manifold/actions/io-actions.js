// @noflow
import {createAction} from 'redux-actions';
import {
  parsePromise,
  loadData,
  modelsPerformance,
  featuresDistribution,
} from '../io';

// -- remote data source -- //
export const FETCH_BACKEND_DATA_START = 'FETCH_BACKEND_DATA_START';
export const FETCH_BACKEND_DATA_SUCCESS = 'FETCH_BACKEND_DATA_SUCCESS';
export const FETCH_MODELS_START = 'FETCH_MODELS_START';
export const FETCH_MODELS_SUCCESS = 'FETCH_MODELS_SUCCESS';
export const FETCH_MODELS_FAILURE = 'FETCH_MODELS_FAILURE';
export const FETCH_FEATURES_START = 'FETCH_FEATURES_START';
export const FETCH_FEATURES_SUCCESS = 'FETCH_FEATURES_SUCCESS';
// -- local data source -- //
export const LOAD_LOCAL_DATA_START = 'LOAD_LOCAL_DATA_START';
export const LOAD_LOCAL_DATA_SUCCESS = 'LOAD_LOCAL_DATA_SUCCESS';

// -- remote data source -- //
export const fetchBackendDataStart = createAction(FETCH_BACKEND_DATA_START);
export const fetchBackendDataSuccess = createAction(FETCH_BACKEND_DATA_SUCCESS);
export const fetchModelsStart = createAction(FETCH_MODELS_START);
export const fetchModelsSuccess = createAction(FETCH_MODELS_SUCCESS);
export const fetchModelsFailure = createAction(FETCH_MODELS_FAILURE);
export const fetchFeaturesStart = createAction(FETCH_FEATURES_START);
export const fetchFeaturesSuccess = createAction(FETCH_FEATURES_SUCCESS);
// -- local data source -- //
export const loadLocalDataStart = createAction(LOAD_LOCAL_DATA_START);
export const loadLocalDataSuccess = createAction(LOAD_LOCAL_DATA_SUCCESS);

// ---------------- ASYNC DATA I/O ACTIONS ---------------- //

// -- local data source -- //

/*
 * Main data action to be exported into applications
 * Loads model performance and feature data into Manifold
 * @param: {Object[][]} fileList, a list of files containing all relevant data needed for Manifold, in csv format
 * @param: {Function} dataTransformer, see `defaultInputDataTransformer` for its signature
 */
export const loadLocalData = ({
  fileList,
  dataTransformer = defaultInputDataTransformer,
}) => dispatch => {
  dispatch(loadLocalDataStart());
  const allPromises = fileList.map(parsePromise);

  Promise.all(allPromises)
    .then(dataTransformer)
    .then(result => {
      dispatch(loadLocalDataSuccess(result));
    });
};

/*
 * default data transformer, transforming a list of parsed files to feature data and performance data,
 * to be inputted into Manifold
 * @param: {Object[][]} values, a list of parsed results of `fileList`
 * @return: {Object} containing 2 fields: `featureData` and `predData`
 * `featureData`: {Object[]} a list of instances,
 * example (2 data instances): [
 *   {feature_0: 21, feature_1: 'B'},
 *   {feature_0: 36, feature_1: 'A'}
 * ]
 * `predData`: {Object[][]} a list of list, each child list is a prediction array from one model
 * example (3 models, 2 data instances): [
 *   [{@prediction:target: 9.4, @prediction:predict: 5.7}, {@prediction:target: 8.3, @prediction:predict: 7.6}],
 *   [{@prediction:target: 9.4, @prediction:predict: 10.1}, {@prediction:target: 8.3, @prediction:predict: 9.8}],
 *   [{@prediction:target: 9.4, @prediction:predict: 8.2}, {@prediction:target: 8.3, @prediction:predict: 6.4}]
 * ]
 */
const defaultInputDataTransformer = values => {
  return {
    featureData: [],
    predData: [],
  };
};

// -- remote data source -- //
export const fetchBackendData = params => dispatch => {
  dispatch(fetchBackendDataStart());
  loadData(params)
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      }
      throw new Error('Data fetching failed!');
    })
    .then(data => dispatch(fetchBackendDataSuccess(data)));
};

export const fetchModels = params => dispatch => {
  dispatch(fetchModelsStart());
  modelsPerformance(params)
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      }
      throw new Error('Data fetching failed!');
    })
    .then(data => dispatch(fetchModelsSuccess(data)));
};

export const fetchFeatures = params => dispatch => {
  dispatch(fetchFeaturesStart());
  featuresDistribution(params)
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      }
      throw new Error('Data fetching failed!');
    })
    .then(data => dispatch(fetchFeaturesSuccess(data)));
};
