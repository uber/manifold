import {absoluteError, logLoss} from '@mlvis/mlvis-common/utils';

export const COLORS = {
  PINK: '#ff0099',
  BLUE: '#818c81',
};

// "performance": log-loss for classification models, squared-log-error for regression
// "actual": raw prediction value
export const METRIC = {
  REGRESSION: {
    ABSOLUTE_ERROR: {
      name: 'absolute error',
      description:
        'the absolute value of difference between predicted value and ground truth',
      func: absoluteError,
    },
  },
  BINARY_CLASSIFICATION: {
    LOG_LOSS: {
      name: 'log loss',
      description: 'the logarithmic loss for predicted probability values',
      func: logLoss,
    },
  },
  ACTUAL: 'actual',
};

export const SEGMENTATION_METHOD = {
  MANUAL: 'manual',
  AUTO: 'auto',
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
