// @noflow
import {createAction} from 'redux-actions';
import {saveCsvFile} from '../io';

export const UPDATE_DIVERGENCE_THRESHOLD = 'UPDATE_DIVERGENCE_THRESHOLD';
export const UPDATE_SELECTED_MODELS = 'UPDATE_SELECTED_MODELS';
export const UPDATE_N_CLUSTERS = 'UPDATE_N_CLUSTERS';
export const UPDATE_METRIC = 'UPDATE_METRIC';
export const UPDATE_SEGMENTATION_METHOD = 'UPDATE_SEGMENTATION_METHOD';
export const UPDATE_SEGMENT_FILTERS = 'UPDATE_SEGMENT_FILTERS';
export const UPDATE_BASE_MODELS = 'UPDATE_BASE_MODELS';
export const UPDATE_SEGMENT_GROUPS = 'UPDATE_SEGMENT_GROUPS';

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

export const exportFeatureEncoder = (
  data,
  path = 'feature-encoder.csv'
) => dispatch => {
  saveCsvFile(path, data);
};
