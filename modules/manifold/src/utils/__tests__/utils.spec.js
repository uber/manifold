import {
  sliceDataset,
  concatDataset,
  gatherDataset,
  filterDataset,
  aggregateDataset,
  computeSortedOrder,
  registerExternalReducers,
  zipObjects,
  product,
  selectFields,
  removeSuffixAndDelimiters,
  groupLatLngPairs,
  validateAndSetDefaultStateSingle,
  validateAndSetDefaultStatesConfigurator,
} from '..';
import {mean} from '@mlvis/mlvis-common/utils';
import {FEATURE_TYPE, FILTER_TYPE} from '@mlvis/mlvis-common/constants';

test('utils: computeSortedOrder', () => {
  const arr1 = [{a: 5}, {a: 3}, {a: 1}, {a: 4}, {a: 2}];
  const order1 = computeSortedOrder(arr1, d => d.a);

  expect(order1).toEqual([2, 4, 1, 3, 0]);
});

test('utils: sliceDataset', () => {
  const data = {
    columns: [[1, 1], [2, 2], [3, 3], [4, 4]],
    fields: [1, 2, 3, 4],
  };
  expect(sliceDataset(data, [1, 3])).toEqual({
    columns: [[2, 2], [3, 3]],
    fields: [2, 3],
  });
});

test('utils: concatDataset', () => {
  const data1 = {
    columns: [[1, 1], [2, 2]],
    fields: [1, 2],
  };
  const data2 = {
    columns: [[3, 3], [4, 4]],
    fields: [3, 4],
  };
  expect(concatDataset([data1, data2])).toEqual({
    columns: [[1, 1], [2, 2], [3, 3], [4, 4]],
    fields: [1, 2, 3, 4],
  });
});

test('utils: gatherDataset', () => {
  const data = {
    columns: [[1, 1], [2, 2], [3, 3], [4, 4]],
    fields: [1, 2, 3, 4],
  };
  expect(gatherDataset(data, [1, 3])).toEqual({
    columns: [[2, 2], [4, 4]],
    fields: [2, 4],
  });
});

const filterCat1 = {
  name: 'feature_cat',
  key: 0,
  type: FILTER_TYPE.INCLUDE,
  value: [1],
};
const filterNum1 = {
  name: 'feature_num',
  key: 1,
  type: FILTER_TYPE.RANGE,
  value: [1, 2],
};

test('utils: filterDataset', () => {
  const data = {columns: [[0, 1, 0, 1, 0], [1, 2, 3, 4, 5]]};
  expect(filterDataset(data, filterNum1)).toEqual([0, 1]);
  expect(filterDataset(data, [filterNum1, filterCat1])).toEqual([1]);
});

test('utils: aggregateDataset', () => {
  const data = {
    fields: [
      {name: 'field1', type: FEATURE_TYPE.CATEGORICAL, tableFieldIndex: 1},
      {name: 'field2', type: FEATURE_TYPE.NUMERICAL, tableFieldIndex: 2},
      {name: 'field3', type: FEATURE_TYPE.NUMERICAL, tableFieldIndex: 3},
      {name: 'field4', type: FEATURE_TYPE.NUMERICAL, tableFieldIndex: 4},
    ],
    columns: [[0, 1, 0, 1, 0], [1, 2, 3, 4, 5], [1, 1, 1, 1], [6, 7, 8, 9, 7]],
  };
  const groupByFeature = data.fields[0];
  const columnsToInclude = [1, 3];
  const aggregateFuncs = [
    {name: 'mean', func: mean},
    {name: 'max', func: arr => Math.max(...arr)},
  ];
  const result = {
    fields: [
      {name: 'field1', type: FEATURE_TYPE.CATEGORICAL, tableFieldIndex: 1},
      {name: 'field2_mean', tableFieldIndex: 2, dataType: 'float'},
      {name: 'field2_max', tableFieldIndex: 3, dataType: 'float'},
      {name: 'field4_mean', tableFieldIndex: 4, dataType: 'float'},
      {name: 'field4_max', tableFieldIndex: 5, dataType: 'float'},
    ],
    columns: [[0, 1], [3, 3], [5, 4], [7, 8], [8, 9]],
  };
  expect(
    aggregateDataset(data, groupByFeature, aggregateFuncs, columnsToInclude)
  ).toEqual(result);
});

test('utils: registerExternalReducers', () => {
  const reducer = registerExternalReducers({a: state => state + 1});
  expect(reducer({a: 3, b: 4})).toEqual({a: 4, b: 4});
});

test('utils: zipObjects', () => {
  const arrays = [
    [{name: 'alice', score: 99}, {name: 'bob', score: 80}],
    [{name: 'alice', score: 'A'}, {name: 'bob', score: 'B'}],
  ];
  const rename = [{}, {score: 'gradeScore'}];
  const zipped = [
    {name: 'alice', score: 99, gradeScore: 'A'},
    {name: 'bob', score: 80, gradeScore: 'B'},
  ];
  expect(zipObjects(arrays, 'name', rename)).toEqual(zipped);
});

test('utils: product', () => {
  expect(product([[1, 2], [3, 4], [5, 6]])).toEqual([
    [1, 3, 5],
    [1, 3, 6],
    [1, 4, 5],
    [1, 4, 6],
    [2, 3, 5],
    [2, 3, 6],
    [2, 4, 5],
    [2, 4, 6],
  ]);
});

test('utils: selectFields', () => {
  const fields = ['field1', 'field2'];
  const data = [
    {field1: 1, field2: 2, field3: 3},
    {field1: 4, field2: 5, field3: 6},
  ];
  const result = [{field1: 1, field2: 2}, {field1: 4, field2: 5}];
  expect(selectFields(fields, data)).toEqual(result);
});

test('utils: removeSuffixAndDelimiters', () => {
  expect(removeSuffixAndDelimiters('Feature_lat', 'lat')).toEqual('Feature');
  expect(removeSuffixAndDelimiters('feature_lat', 'lat')).toEqual('feature');
});

test('utils: groupLatLngPairs', () => {
  const fields = [
    {name: 'field1', id: 1},
    {name: 'field2_lat', id: 2},
    {name: 'field2_lng', id: 3},
  ];
  const result = [
    {name: 'field1', id: 1},
    {
      name: 'field2',
      pair: [{name: 'field2_lat', id: 2}, {name: 'field2_lng', id: 3}],
    },
  ];
  expect(groupLatLngPairs(fields)).toEqual(result);
});

test('utils: validateAndSetDefaultStateSingle', () => {
  const state1 = {a: {c: 5}, b: 6};
  const state2 = {a: {c: 5}, b: 11};
  const field = 'b';
  const validateFunc = state => state.b >= state.a.c * 2;
  const setDefaultFunc = state => 2 * state.a.c;

  const result1 = validateAndSetDefaultStateSingle(
    state1,
    field,
    validateFunc,
    setDefaultFunc
  );
  const result2 = validateAndSetDefaultStateSingle(
    state2,
    field,
    validateFunc,
    setDefaultFunc
  );
  expect(result1).toEqual({a: {c: 5}, b: 10});
  expect(result2).toEqual({a: {c: 5}, b: 11});
  // should create state if field is not valid
  expect(result1).not.toBe(state1);
  // should not change state if field is valid
  expect(result2).toBe(state2);
  // should not affect other fields
  expect(result1.a).toBe(state1.a);
  expect(result2.a).toBe(state2.a);
});

test('utils: validateAndSetDefaultStatesConfigurator', () => {
  const fields = ['b', 'c'];
  const fieldsReverseOrder = ['c', 'b'];
  const validateFuncs = {
    b: state => state.b > state.a,
    c: state => state.c > state.b,
  };
  const setDefaultFuncs = {
    b: state => state.a + 1,
    c: state => state.b + 2,
  };
  const validateAndSetDefault = validateAndSetDefaultStatesConfigurator(
    fields,
    validateFuncs,
    setDefaultFuncs
  );
  const validateAndSetDefaultReverseOrder = validateAndSetDefaultStatesConfigurator(
    fieldsReverseOrder,
    validateFuncs,
    setDefaultFuncs
  );
  const state1_1 = {a: 2, b: 2, c: 2};
  const result1_1 = validateAndSetDefault(state1_1);
  // test updating both field `b` and field `c`
  expect(result1_1).toEqual({a: 2, b: 3, c: 5});
  expect(result1_1).not.toBe(state1_1);

  const state1_2 = {...result1_1, b: 4};
  const result1_2 = validateAndSetDefault(state1_2);
  // test updaing the state1 a second time, without any fields being invalid
  expect(result1_2).toEqual({a: 2, b: 4, c: 5});
  expect(result1_2).toBe(state1_2);

  const state1_3 = {...result1_2, b: 5};
  const result1_3 = validateAndSetDefault(state1_3);
  // test updaing the state1 a third time, with some fields being invalid
  expect(result1_3).toEqual({a: 2, b: 5, c: 7});
  expect(result1_3).not.toBe(state1_2);

  const state2_1 = {a: 2, b: 2, c: 2};
  const result2_1 = validateAndSetDefaultReverseOrder(state2_1);
  // test reversing dependency order between field `b` and field `c`
  expect(result2_1).toEqual({a: 2, b: 3, c: 4});
  expect(result2_1).not.toBe(state2_1);

  const state2_2 = {...result2_1, a: 2.5};
  const result2_2 = validateAndSetDefaultReverseOrder(state2_2);
  // test updaing the state2 a second time, without any fields being invalid
  expect(result2_2).toEqual({a: 2.5, b: 3, c: 4});
  expect(result2_2).toBe(state2_2);

  const state2_3 = {...result2_2, a: 3};
  const result2_3 = validateAndSetDefaultReverseOrder(state2_3);
  // test updaing the state2 a third time, with some fields being invalid
  expect(result2_3).toEqual({a: 3, b: 4, c: 4});
  expect(result2_3).not.toBe(state2_2);
});
