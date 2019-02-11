// @noflow
export const FILTER_TYPE = {
  RANGE: 'range',
  INCLUDE: 'include',
  EXCLUDE: 'exclude',
  FUNC: 'func',
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

export const FEATURE_TYPE = {
  CATEGORICAL: 'categorical',
  NUMERICAL: 'numerical',
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

export const FEATURE_FILTERS = [
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:restaurant_order_accepted_to_finished_in_seconds_avg_1week_now',
    value: [0, 40],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_rush_created__from_order_accepted_to_rush_created_avg_10min',
    value: [0, 500],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:nrf__at_order_accepted__prep_time_adjusted_by_count_10min',
    value: [0, 10],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_order_created_to_accepted_in_seconds_avg_1week',
    value: [0, 80],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_order_count_1week',
    value: [0, 100],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_rush_begun_to_dropoff_in_seconds_avg_1week',
    value: [200, 1200],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_delivery_radius',
    value: [0, 7.5],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_rush_begun_to_dropoff_in_seconds_avg_1week_now',
    value: [0, 1600],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_rush_accepted_to_begun_in_seconds_avg_1week_now',
    value: [0, 1500],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_order_accpeted__from_order_created_to_order_accepted_count_10min',
    value: [0, 15],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:nrf__at_order_accepted__prep_time_adjusted_by_avg_10min',
    value: [0, 200],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_order_created_to_rush_begun_in_seconds_avg_1week',
    value: [50, 2000],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:restaurant_order_created_to_rush_begun_in_seconds_avg_1week_now',
    value: [50, 2000],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_latitude',
    value: [-5, 90],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_longitude',
    value: [-20, 180],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:nrf__at_order_accepted__adjusted_prep_time_avg_10min',
    value: [0, 2000],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_prep_finished__from_order_accepted_to_prep_finished_avg_10min',
    value: [0, 2000],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_order_count_1week_now',
    value: [0, 500],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_rush_arrived__from_rush_began_to_rush_arrived_at_dropoff_avg_10min',
    value: [0, 1800],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_rush_accepted_to_begun_in_seconds_avg_1week',
    value: [50, 1200],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:restaurant_order_created_to_accepted_in_seconds_avg_1week_now',
    value: [0, 150],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_order_accepted_to_finished_in_seconds_avg_1week',
    value: [0, 2000],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_order_accpeted__from_order_created_to_order_accepted_avg_10min',
    value: [0, 200],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_rush_created_to_accepted_in_seconds_avg_1week',
    value: [0, 200],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_rush_arrived__from_rush_accepted_to_rush_arrived_at_pickup_avg_10min',
    value: [0, 1000],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:restaurant_rush_created_to_accepted_in_seconds_avg_1week_now',
    value: [0, 200],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:ti_ueta_seconds',
    value: [0, 1200],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:restaurant_default_prep_time',
    value: [0, 50],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_rush_began__from_rush_arrived_to_rush_began_avg_10min',
    value: [0, 6],
  },
  {
    type: FILTER_TYPE.RANGE,
    key:
      '@derived:nrf__at_rush_began__from_prep_finished_to_rush_began_count_10min',
    value: [0, 6],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:nrf__at_order_created__prep_time_avg_10min',
    value: [0, 2000],
  },
  {
    type: FILTER_TYPE.RANGE,
    key: '@derived:nrf__at_order_accepted__adjusted_prep_time_count_10min',
    value: [0, 50],
  },
];
