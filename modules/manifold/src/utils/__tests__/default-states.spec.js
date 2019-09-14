import {
  defaultSegmentFiltersFromBaseCols,
  defaultSegmentFiltersFromFieldDef,
  defaultBaseCols,
} from '../default-states';
import {
  FILTER_TYPE,
  FIELD_ROLE,
  FEATURE_TYPE,
  DATA_TYPE,
} from '@mlvis/mlvis-common/constants';

const data = {
  fields: [
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
  ],
};

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

test('utils: default-states/defaultSegmentFiltersFromBaseCols', () => {
  expect(defaultSegmentFiltersFromBaseCols(data, [0, 2])).toEqual([
    [filters[0][0], filters[2][0]],
    [filters[0][0], filters[2][1]],
    [filters[0][1], filters[2][0]],
    [filters[0][1], filters[2][1]],
  ]);
});

test('utils: default-states/defaultSegmentFiltersFromFieldDef', () => {
  expect(defaultSegmentFiltersFromFieldDef(data.fields[0])).toEqual(filters[0]);
  expect(defaultSegmentFiltersFromFieldDef(data.fields[1])).toEqual(filters[1]);
  expect(defaultSegmentFiltersFromFieldDef(data.fields[2])).toEqual(filters[2]);
});

test('utils: default-states/defaultBaseCols', () => {
  expect(defaultBaseCols({score: [11, 13]})).toEqual([11, 12]);
});
