// @noflow
import {createAction} from 'redux-actions';
import {parsePromise} from 'packages/mlvis-common/utils';
import {loadData, modelsPerformance, featuresDistribution} from '../io';
import {isDatasetIncomplete, validateInputData} from '../utils';

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
export const LOAD_LOCAL_DATA_FAILURE = 'LOAD_LOCAL_DATA_FAILURE';

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
export const loadLocalDataFailure = createAction(LOAD_LOCAL_DATA_FAILURE);

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
    .then(validateInputData)
    .then(result => {
      dispatch(loadLocalDataSuccess(result));
    });
  // TODO: catch errors
  // .catch(error => dispatch(loadLocalDataFailure(error)));
};

/**
 * Use this loader when the data has already been loaded via a 3rd party loader
 * @param {array} data, an array of objects loaded from e.g. .csv or .arrow files
 * @param {function} dataTransformer, see `defaultInputDataTransformer` for its signature
 * TODO: combine with the loadLocalData util above, make parsing logic optional.
 */
export const loadPrefetchedData = ({
  data,
  dataTransformer = defaultInputDataTransformer,
}) => dispatch => {
  dispatch(loadLocalDataStart());
  const processedData = dataTransformer(data);
  const validatedData = validateInputData(processedData);
  dispatch(loadLocalDataSuccess(validatedData));
};

/*
 * default data transformer, transforming a list of parsed files to feature data and performance data,
 * to be inputted into Manifold
 * @param: {Object[][]} values, a list of parsed results of `fileList`
 * @return: {Object} containing 3 fields: `x`, `yPred` and `yTrue`
 *
 * `x`: {Object[]} a list of instances with features,
 * example (2 data instances):
 * [
 *   {feature_0: 21, feature_1: 'B'},
 *   {feature_0: 36, feature_1: 'A'}
 * ]
 *
 * `yPred`: {Object[][]} a list of list, each child list is a prediction array from one model for each data instance
 * example (3 models, 2 data instances, 2 classes ['false', 'true']):
 * [
 *   [{false: 0.1, true: 0.9}, {false: 0.8, true: 0.2}],
 *   [{false: 0.3, true: 0.7}, {false: 0.9, true: 0.1}],
 *   [{false: 0.6, true: 0.4}, {false: 0.4, true: 0.6}]
 * ]
 *
 * `yTrue`: {Object[]} a list, ground truth for each data instance.
 * Values must be numbers for regression model, must be strings that match object keys in `yPred` for classification models
 * example (2 data instances, 2 classes ['false', 'true']):
 * [
 *   'true',
 *   'false'
 * ]
 */
const defaultInputDataTransformer = values => {
  return {
    x: values[0],
    yTrue: values.slice(1, -1),
    yPred: values[values.length - 1],
  };
};

/**
 * Convenient wrapper around `loadLocalData`, taking `x`, `yPred`, `yTrue` as input.
 * @param {Object} userData - {x: <file>, yPred: [<file>], yTrue: <file>}
 */
export const loadUserData = ({x, yPred, yTrue}) => {
  if (isDatasetIncomplete({x, yPred, yTrue})) {
    /* eslint-disable no-console */
    console.error('Dataset is incomplete');
    /* eslint-enable no-console */
    return;
  }
  return loadLocalData({
    fileList: [x, ...yPred, yTrue],
    dataTransformer: userDataTransformer,
  });
};

const userDataTransformer = fileList => {
  const dataList = fileList.map(v => v.data);
  // todo: yTrue should accept object as values as well
  const yTrue = dataList[dataList.length - 1].map(d => Object.values(d)[0]);
  return {
    x: dataList[0],
    yPred: dataList.slice(1, -1),
    yTrue,
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
