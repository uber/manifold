import {createAction} from 'redux-actions';

export const UPDATE_SELECTED_INSTANCES = 'UPDATE_SELECTED_INSTANCES';
export const UPDATE_DIVERGENCE_THRESHOLD = 'UPDATE_DIVERGENCE_THRESHOLD';
export const UPDATE_SELECTED_MODELS = 'UPDATE_SELECTED_MODELS';
export const UPDATE_N_CLUSTERS = 'UPDATE_N_CLUSTERS';
export const UPDATE_METRIC = 'UPDATE_METRIC';
export const UPDATE_SEGMENTATION_METHOD = 'UPDATE_SEGMENTATION_METHOD';
export const UPDATE_SEGMENT_FILTERS = 'UPDATE_SEGMENT_FILTERS';
export const UPDATE_BASE_COLS = 'UPDATE_BASE_COLS';
export const UPDATE_SEGMENT_GROUPS = 'UPDATE_SEGMENT_GROUPS';
export const UPDATE_DISPLAY_GEO_FEATURES = 'UPDATE_DISPLAY_GEO_FEATURES';
export const UPDATE_COLOR_BY_FEATURE = 'UPDATE_COLOR_BY_FEATURE';

export const updateDivergenceThreshold = createAction(
  UPDATE_DIVERGENCE_THRESHOLD
);
export const updateSelectedInstances = createAction(UPDATE_SELECTED_INSTANCES);
export const updateSelectedModels = createAction(UPDATE_SELECTED_MODELS);
export const updateNClusters = createAction(UPDATE_N_CLUSTERS);
export const updateMetric = createAction(UPDATE_METRIC);
export const updateSegmentationMethod = createAction(
  UPDATE_SEGMENTATION_METHOD
);
export const updateSegmentFilters = createAction(UPDATE_SEGMENT_FILTERS);
export const updateBaseCols = createAction(UPDATE_BASE_COLS);
export const updateSegmentGroups = createAction(UPDATE_SEGMENT_GROUPS);
export const updateDisplayGeoFeatures = createAction(
  UPDATE_DISPLAY_GEO_FEATURES
);
export const updateColorByFeature = createAction(UPDATE_COLOR_BY_FEATURE);
