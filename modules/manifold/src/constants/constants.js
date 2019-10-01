import {absoluteError, logLoss} from '@mlvis/mlvis-common/utils';

export const COLORS = {
  PINK: '#ff0099',
  BLUE: '#818c81',
};

export const MODEL_TYPE = {
  REGRESSION: 'REGRESSION',
  BIN_CLASS: 'BIN_CLASS',
  MULT_CLASS: 'MULT_CLASS',
};

export const MODEL_TYPE_FROM_N_CLASSES = nClasses => {
  return nClasses === 1
    ? MODEL_TYPE.REGRESSION
    : nClasses === 2
    ? MODEL_TYPE.BIN_CLASS
    : MODEL_TYPE.MULT_CLASS;
};

export const METRIC = {
  ABSOLUTE_ERROR: {
    name: 'absolute error',
    description:
      'the absolute value of difference between predicted value and ground truth',
    func: absoluteError,
  },
  LOG_LOSS: {
    name: 'log loss',
    description: 'the logarithmic loss for predicted probability values',
    func: logLoss,
  },
};

export const METRIC_OPTIONS = {
  REGRESSION: [METRIC.ABSOLUTE_ERROR],
  BIN_CLASS: [METRIC.LOG_LOSS],
  MULT_CLASS: [METRIC.LOG_LOSS],
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
