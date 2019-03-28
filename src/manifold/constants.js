// @noflow
import {FEATURE_TYPE, FILTER_TYPE} from 'packages/mlvis-common/constants';

export {FEATURE_TYPE, FILTER_TYPE};

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

export const PERF_PREFIX = 'model_';
export const ACTUAL_PREFIX = `modelClass_`;

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

export const HINTS = {
  PERF: {
    HELP: 'PERF_HELP',
    INSIGHT: 'PERF_INSIGHT',
  },
  FEATURE: {
    HELP: 'FEATURE_HELP',
    INSIGHT: 'FEATURE_INSIGHT',
  },
};

export const CONTROL_MARGIN = 20;
