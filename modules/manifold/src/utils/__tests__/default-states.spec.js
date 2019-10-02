import {
  defaultMetric,
  isValidMetric,
  defaultBaseCols,
  isValidBaseCols,
  defaultNClusters,
  isValidNClusters,
  defaultSegmentFilters,
  defaultSegmentFiltersFromFieldDef,
  isValidSegmentFilters,
  isValidSegmentFilterFromFieldDef,
  defaultSegmentGroups,
  isValidSegmentGroups,
} from '../default-states';
import {METRIC} from '../../constants';
import {
  FILTER_TYPE,
  FIELD_ROLE,
  FEATURE_TYPE,
  DATA_TYPE,
} from '@mlvis/mlvis-common/constants';

const fields = [
  {
    name: 'feature1',
    tableFieldIndex: 1,
    type: FEATURE_TYPE.CATEGORICAL,
    role: FIELD_ROLE.FEATURE,
    dataType: DATA_TYPE.INTEGER,
    domain: [0, 1, 2],
  },
  {
    name: 'feature2',
    type: FEATURE_TYPE.NUMERICAL,
    tableFieldIndex: 2,
    role: FIELD_ROLE.FEATURE,
    dataType: DATA_TYPE.REAL,
    domain: [0.1, 0.5, 0.8, 1.2, 1.5],
  },
  {
    name: '@score:model_0',
    type: FEATURE_TYPE.NUMERICAL,
    tableFieldIndex: 3,
    role: FIELD_ROLE.SCORE,
    dataType: DATA_TYPE.REAL,
    domain: [-0.1, 0.5, 0.8, 1.2, 1.5],
  },
];

const filters = [
  [
    {name: 'feature1', key: 0, type: FILTER_TYPE.INCLUDE, value: [0]},
    {name: 'feature1', key: 0, type: FILTER_TYPE.INCLUDE, value: [1]},
  ],
  [
    {name: 'feature2', key: 1, type: FILTER_TYPE.RANGE, value: [0.1, 0.8]},
    {name: 'feature2', key: 1, type: FILTER_TYPE.RANGE, value: [0.8, 1.5]},
  ],
  [
    {
      name: '@score:model_0',
      key: 2,
      type: FILTER_TYPE.RANGE,
      value: [-0.1, 0],
    },
    {
      name: '@score:model_0',
      key: 2,
      type: FILTER_TYPE.RANGE,
      value: [0, 1.5],
    },
  ],
];

test('utils: default-states/defaultMetric', () => {
  expect(defaultMetric({modelsMeta: {nClasses: 1}})).toEqual(
    METRIC.ABSOLUTE_ERROR
  );
  expect(defaultMetric({modelsMeta: {nClasses: 2}})).toEqual(METRIC.LOG_LOSS);
  expect(defaultMetric({modelsMeta: {nClasses: 3}})).toEqual(METRIC.LOG_LOSS);
});

test('utils: default-states/isValidMetric', () => {
  expect(
    isValidMetric({metric: METRIC.LOG_LOSS, modelsMeta: {nClasses: 2}})
  ).toBeTruthy();
  expect(
    isValidMetric({metric: METRIC.LOG_LOSS, modelsMeta: {nClasses: 1}})
  ).toBeFalsy();
});

test('utils: default-states/defaultBaseCols', () => {
  const state = {columnTypeRanges: {score: [11, 13]}};
  expect(defaultBaseCols(state)).toEqual([11, 12]);
});

test('utils: default-states/isValidBaseCols', () => {
  const state1 = {data: {fields}, baseCols: [1, 2]};
  const state2 = {data: {fields}, baseCols: [1, 3]};
  expect(isValidBaseCols(state1)).toBeTruthy();
  expect(isValidBaseCols(state2)).toBeFalsy();
});

test('utils: default-states/defaultNClusters', () => {
  const state1 = {data: {columns: [[1, 2, 3]]}};
  const state2 = {data: {columns: [[1, 2, 3, 4, 5]]}};
  expect(defaultNClusters(state1)).toEqual(3);
  expect(defaultNClusters(state2)).toEqual(4);
});

test('utils: default-states/isValidNClusters', () => {
  const state1 = {data: {columns: [[1, 2, 3, 4]]}, nClusters: 3};
  const state2 = {data: {columns: [[1, 2]]}, nClusters: 4};
  const state3 = {data: {columns: [[1, 2, 3, 4]]}, nClusters: null};
  expect(isValidNClusters(state1)).toBeTruthy();
  expect(isValidNClusters(state2)).toBeFalsy();
  expect(isValidNClusters(state3)).toBeFalsy();
});

test('utils: default-states/defaultSegmentFilters', () => {
  const state1 = {data: {fields}, baseCols: [0, 2]};
  expect(defaultSegmentFilters(state1)).toEqual([
    [filters[0][0], filters[2][0]],
    [filters[0][0], filters[2][1]],
    [filters[0][1], filters[2][0]],
    [filters[0][1], filters[2][1]],
  ]);
});

test('utils: default-states/defaultSegmentFiltersFromFieldDef', () => {
  expect(defaultSegmentFiltersFromFieldDef(fields[0])).toEqual(filters[0]);
  expect(defaultSegmentFiltersFromFieldDef(fields[1])).toEqual(filters[1]);
  expect(defaultSegmentFiltersFromFieldDef(fields[2])).toEqual(filters[2]);
});

test('utils: default-states/isValidSegmentFilters', () => {
  const state1 = {
    data: {fields},
    baseCols: [0, 2],
    segmentFilters: [[{key: 1}], []],
  };
  const state2 = {
    data: {fields},
    baseCols: [0, 2],
    segmentFilters: [[{key: 1}], [{key: 2}]],
  };
  const state3 = {
    data: {fields},
    baseCols: [0, 2],
    segmentFilters: [[{key: 2}, {key: 0}], [{key: 0}, {key: 2}]],
  };
  const state4 = {
    data: {fields},
    baseCols: [0, 2],
    segmentFilters: [
      [
        {key: 0, type: FILTER_TYPE.INCLUDE, value: [1]},
        {key: 2, type: FILTER_TYPE.RANGE, value: [0.7, Infinity]},
      ],
      [
        {key: 0, type: FILTER_TYPE.INCLUDE, value: [1]},
        {key: 2, type: FILTER_TYPE.RANGE, value: [-Infinity, 0.8]},
      ],
    ],
  };
  // filter empty
  expect(isValidSegmentFilters(state1)).toBeFalsy();
  // filter keys don't match baseColIds
  expect(isValidSegmentFilters(state2)).toBeFalsy();
  // baseCol and their corresponding filter not in the same order
  expect(isValidSegmentFilters(state3)).toBeFalsy();
  // baseCol and their corresponding filter not in the same order
  expect(isValidSegmentFilters(state4)).toBeTruthy();
});

test('utils: default-states/isValidSegmentFilterFromFieldDef', () => {
  const fieldCat = {
    type: FEATURE_TYPE.CATEGORICAL,
    domain: [1, 3, 6],
  };
  const filterCat1 = {
    type: FILTER_TYPE.INCLUDE,
    value: [5],
  };
  const filterCat2 = {
    type: FILTER_TYPE.INCLUDE,
    value: [1, 3, 6],
  };
  const filterCat3 = {
    type: FILTER_TYPE.INCLUDE,
    value: [3],
  };
  const fieldNum = {
    type: FEATURE_TYPE.NUMERICAL,
    domain: [1, 3, 6],
  };
  const filterNum1 = {
    type: FILTER_TYPE.RANGE,
    value: [3],
  };
  const filterNum2 = {
    type: FILTER_TYPE.RANGE,
    value: [1, 6],
  };
  const filterNum3 = {
    type: FILTER_TYPE.RANGE,
    value: [-10, -1],
  };
  const filterNum4 = {
    type: FILTER_TYPE.RANGE,
    value: [-1, 5],
  };
  const fieldOther = {
    type: 'other',
  };
  const filterOther = {
    type: FILTER_TYPE.FUNC,
    value: d => d > 1,
  };
  expect(isValidSegmentFilterFromFieldDef(filterCat1, fieldCat)).toBeFalsy();
  // todo: whether it's necessary that filter must contain a subset of column domain
  expect(isValidSegmentFilterFromFieldDef(filterCat2, fieldCat)).toBeTruthy();
  expect(isValidSegmentFilterFromFieldDef(filterCat3, fieldCat)).toBeTruthy();
  expect(isValidSegmentFilterFromFieldDef(filterNum1, fieldNum)).toBeFalsy();
  // todo: whether it's necessary that filter must contain a subset of column domain
  expect(isValidSegmentFilterFromFieldDef(filterNum2, fieldNum)).toBeTruthy();
  // filter must be non-empty
  expect(isValidSegmentFilterFromFieldDef(filterNum3, fieldNum)).toBeFalsy();
  expect(isValidSegmentFilterFromFieldDef(filterNum4, fieldNum)).toBeTruthy();
  expect(
    isValidSegmentFilterFromFieldDef(filterOther, fieldOther)
  ).toBeTruthy();
});

test('utils: default-states/defaultSegmentGroups', () => {
  const state1 = {
    isManualSegmentation: false,
    nClusters: 5,
    segmentFilters: [0, 0],
  };
  const state2 = {
    isManualSegmentation: true,
    nClusters: 2,
    segmentFilters: [0, 0, 0],
  };
  expect(defaultSegmentGroups(state1)).toEqual([[3, 4], [0, 1, 2]]);
  expect(defaultSegmentGroups(state2)).toEqual([[2], [0, 1]]);
});

test('utils: default-states/isValidSegmentGroups', () => {
  const state1 = {
    isManualSegmentation: false,
    nClusters: 5,
    segmentFilters: [1, 2],
  };
  // not ok if one group is empty
  expect(
    isValidSegmentGroups({...state1, segmentGroups: [[], [1]]})
  ).toBeFalsy();
  // not ok if index out of range
  expect(
    isValidSegmentGroups({...state1, segmentGroups: [[1], [5]]})
  ).toBeFalsy();
  // not ok if index repeated in 2 groups
  expect(
    isValidSegmentGroups({...state1, segmentGroups: [[1, 2, 3], [1, 4]]})
  ).toBeFalsy();
  expect(
    isValidSegmentGroups({...state1, segmentGroups: [[1, 2, 3], [0, 4]]})
  ).toBeTruthy();
});
