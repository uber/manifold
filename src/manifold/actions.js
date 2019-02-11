// @noflow
import {createAction} from 'redux-actions';
import {
  loadData,
  modelsPerformance,
  featuresDistribution,
  loadCsvFileWithoutWorker,
  saveCsvFile,
} from './io';
import {isFeatureCsv} from './utils';

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

export const UPDATE_DIVERGENCE_THRESHOLD = 'UPDATE_DIVERGENCE_THRESHOLD';
export const UPDATE_VIEWPORT = 'UPDATE_VIEWPORT';
export const TOGGLE_UPLOAD_MODAL = 'TOGGLE_UPLOAD_MODAL';

export const UPDATE_SELECTED_MODELS = 'UPDATE_SELECTED_MODELS';
export const UPDATE_N_CLUSTERS = 'UPDATE_N_CLUSTERS';
export const UPDATE_METRIC = 'UPDATE_METRIC';
export const UPDATE_SEGMENTATION_METHOD = 'UPDATE_SEGMENTATION_METHOD';
export const UPDATE_SEGMENT_FILTERS = 'UPDATE_SEGMENT_FILTERS';
export const UPDATE_BASE_MODELS = 'UPDATE_BASE_MODELS';
export const UPDATE_SEGMENT_GROUPS = 'UPDATE_SEGMENT_GROUPS';

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

export const updateDivergenceThreshold = createAction(
  UPDATE_DIVERGENCE_THRESHOLD
);

export const updateSelectedModels = createAction(UPDATE_SELECTED_MODELS);
export const updateNClusters = createAction(UPDATE_N_CLUSTERS);
export const updateMetric = createAction(UPDATE_METRIC);
export const updateSegmentationMethod = createAction(
  UPDATE_SEGMENTATION_METHOD
);
export const updateSegmentFilters = createAction(UPDATE_SEGMENT_FILTERS);
export const updateSegmentGroups = createAction(UPDATE_SEGMENT_GROUPS);
// export const updateBaseModels = createAction(UPDATE_BASE_MODELS);

// ---------------- ASYNC DATA I/O ACTIONS ---------------- //
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

export const loadLocalData = fileList => dispatch => {
  dispatch(loadLocalDataStart());
  const featureData = [];
  const predData = [];

  fileList.forEach(path => {
    // in case of upload, use path.originFileObj; in case of sample data in S3, use path
    const file = path.originFileObj || path;
    loadCsvFileWithoutWorker(file, resp => {
      const {data, fields} = resp;
      if (isFeatureCsv(fields)) {
        featureData.push(data);
      } else {
        predData.push(data);
      }
      // wait until all files are uploaded. todo: change to promise
      if (featureData.length + predData.length === fileList.length) {
        dispatch(
          loadLocalDataSuccess({
            featureData,
            predData,
          })
        );
      }
    });
  });
};

export const exportFeatureEncoder = (
  data,
  path = 'feature-encoder.csv'
) => dispatch => {
  saveCsvFile(path, data);
};
