import {FEATURE_TYPE} from '@mlvis/mlvis-common/constants';

export const COLORS = {
  PINK: '#ff0099',
  BLUE: '#818c81',
  // TODO add more if we need more than two segment groups
};

// urls for sample data
export const SAMPLE_DATA_S3 = {
  REGRESSION: ['/manifold/feature.csv', '/manifold/pred_reg.csv'],
  BIN_CLASSIFICATION: [
    '/manifold/feature.csv',
    '/manifold/pred_bin_0.csv',
    '/manifold/pred_bin_1.csv',
  ],
};

// "performance": log-loss for classification models, squared-log-error for regression
// "actual": raw prediction value
export const METRIC = {
  PERFORMANCE: 'performance',
  ACTUAL: 'actual',
};

// Users will be able to provide a list of feature names that they would like to enforce
// to be a particular type. If non is provided, the enforced list is empty,
// and every feature's type will be automatically inferred.
export const DEFAULT_FEATURE_TYPES = {
  [FEATURE_TYPE.CATEGORICAL]: [],
  [FEATURE_TYPE.NUMERICAL]: [],
  [FEATURE_TYPE.GEO]: [],
};

export const SCORE_PREFIX = '@score:';
export const scoreColName = modelId => `${SCORE_PREFIX}model_${modelId}`;
export const PRED_PREFIX = `@pred:`;
export const predColName = (modelId, classId) =>
  `${PRED_PREFIX}model_${modelId}_class_${classId}`;
export const GROUND_TRUTH_NAME = `@groundTruth`;
export const makeUuid = dataId => `uuid${dataId}`;

// view constants
export const THEME_COLOR = '#276ef1';
export const VIEW_MODE = {
  SINGLE: 'SINGLE',
  COORDINATED: 'COORDINATED',
};
export const VIEW_TAB = {
  PERF: 'PERF',
  FEATURE: 'FEATURE',
};

export const VIEW_NAME = {
  PERF: 'Performance comparison',
  FEATURE: 'Feature attribution',
};

export const HELP_TYPE = {
  PERF: 'PERF',
  FEATURE: 'FEATURE',
};

export const CONTROL_MARGIN = 20;
