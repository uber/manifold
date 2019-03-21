// @noflow
import {FEATURE_TYPE, FILTER_TYPE} from '@uber/mlvis-common/constants';

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

export const defaultFeatureTypes = {
  [FEATURE_TYPE.CATEGORICAL]: [],
  [FEATURE_TYPE.NUMERICAL]: [],
  [FEATURE_TYPE.GEO]: [],
};

export const PRED_PREFIX = '@prediction:';
export const PERF_PREFIX = 'model_';
export const ACTUAL_PREFIX = `modelClass_`;

export const INDEXED_FEATURE_PREFIX = '@prediction:indexed_';

export const PRED_INDEX = '@prediction:predictedindexedlabel';
export const TARGET_INDEX = '@prediction:indexedlabel';

// prediction and target column names in input data from Michelangelo
export const PRED_COL_IN = '@prediction:predict';
export const TARGET_COL_IN = '@prediction:target';

// prediction and target column names in Manifold representation
export const TARGET_COL_OUT = m => `groundTruth_{$m}`;
export const CLASS_LABELS = columns => {
  const predColsNonClass = [
    PRED_INDEX,
    TARGET_INDEX,
    PRED_COL_IN,
    TARGET_COL_IN,
  ];
  return columns
    .filter(
      col =>
        col.startsWith(PRED_PREFIX) &&
        !predColsNonClass.includes(col) &&
        !col.startsWith(INDEXED_FEATURE_PREFIX)
    )
    .map(classCol => classCol.replace(PRED_PREFIX, ''));
};

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
