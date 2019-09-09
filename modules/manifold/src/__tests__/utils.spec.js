import {
  isValidSegmentGroups,
  sliceDataset,
  concatDataset,
  gatherDataset,
  filterDataset,
  aggregateDataset,
  computeSortedOrder,
  updateSegmentGroups,
  isValidFilterVals,
  getSegmentFiltersFromValues,
  getFilterValsFromProps,
  registerExternalReducers,
  zipObjects,
  selectFields,
  removeSuffixAndDelimiters,
  groupLatLngPairs,
} from '../utils';
import {mean} from 'packages/mlvis-common/utils';
import {FEATURE_TYPE, FILTER_TYPE} from 'packages/mlvis-common/constants';

test('utils: isValidSegmentGroups', () => {
  // not ok if one group is empty
  expect(isValidSegmentGroups([[], [1]], 5)).toBeFalsy();
  // not ok if index out of range
  expect(isValidSegmentGroups([[1], [5]], 5)).toBeFalsy();
  // not ok if index repeated in 2 groups
  expect(isValidSegmentGroups([[1, 2, 3], [1, 4]], 5)).toBeFalsy();
  expect(isValidSegmentGroups([[1, 2, 3], [0, 4]], 5)).toBeTruthy();
});

test('utils: computeSortedOrder', () => {
  const arr1 = [{a: 5}, {a: 3}, {a: 1}, {a: 4}, {a: 2}];
  const order1 = computeSortedOrder(arr1, d => d.a);

  expect(order1).toEqual([2, 4, 1, 3, 0]);
});

test('utils: updateSegmentGroups', () => {
  // deselect segment 1 from group 0
  expect(updateSegmentGroups([[0, 1], [2, 3]], 0, 1)).toEqual([[0], [2, 3]]);
  // move segment 2 from group 1 to group 0
  expect(updateSegmentGroups([[0, 1], [2, 3]], 0, 2)).toEqual([[0, 1, 2], [3]]);
  // no action if segment 3 is the only segment in group 1 when moving it to group 0
  expect(updateSegmentGroups([[0, 1, 2], [3]], 0, 3)).toEqual([[0, 1, 2], [3]]);
  // no action if segment 3 is the only segment in group 1 when deselecting from segment 1
  expect(updateSegmentGroups([[0, 1, 2], [3]], 1, 3)).toEqual([[0, 1, 2], [3]]);
  // sanity check
  expect(updateSegmentGroups([[0, 1], [2, 3]])).toEqual([[0, 1], [2, 3]]);
});

const featureMetaCat = {
  name: 'feature_cat',
  tableFieldIndex: 1,
  type: FEATURE_TYPE.CATEGORICAL,
  domain: [1, 3, 5],
};
const featureMetaNum = {
  name: 'feature_num',
  tableFieldIndex: 2,
  type: FEATURE_TYPE.NUMERICAL,
  domain: [1, 5],
};
const filterCat1 = {
  name: 'feature_cat',
  key: 0,
  type: FILTER_TYPE.INCLUDE,
  value: [1],
};
const filterCat2 = {
  name: 'feature_cat',
  key: 0,
  type: FILTER_TYPE.INCLUDE,
  value: [5],
};
const filterNum1 = {
  name: 'feature_num',
  key: 1,
  type: FILTER_TYPE.RANGE,
  value: [1, 2],
};
const filterNum2 = {
  name: 'feature_num',
  key: 1,
  type: FILTER_TYPE.RANGE,
  value: [4, 5],
};

test('utils: isValidFilterVals', () => {
  expect(isValidFilterVals([[1], [5]], featureMetaCat)).toBeTruthy();
  expect(isValidFilterVals([[1], [1]], featureMetaCat)).toBeFalsy();
  expect(isValidFilterVals([[], [1]], featureMetaCat)).toBeFalsy();
  expect(isValidFilterVals([[1, 2], [4, 5]], featureMetaNum)).toBeTruthy();
  expect(isValidFilterVals([[0, 2], [4, 5]], featureMetaNum)).toBeFalsy();
  expect(isValidFilterVals([[1, 2], [4]], featureMetaNum)).toBeFalsy();
});

test('utils: getSegmentFiltersFromValues', () => {
  expect(getSegmentFiltersFromValues([[1], [5]], featureMetaCat)).toEqual([
    [filterCat1],
    [filterCat2],
  ]);
  expect(getSegmentFiltersFromValues([[1, 2], [4, 5]], featureMetaNum)).toEqual(
    [[filterNum1], [filterNum2]]
  );
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

test('utils: getFilterValsFromProps', () => {
  expect(
    getFilterValsFromProps([[filterCat1], [filterCat2]], featureMetaCat)
  ).toEqual([[1], [5]]);
  expect(getFilterValsFromProps([[{}], [{}]], featureMetaCat)).toEqual([
    [],
    [],
  ]);
  expect(
    getFilterValsFromProps([[filterNum1], [filterNum2]], featureMetaNum)
  ).toEqual([[1, 2], [4, 5]]);
  expect(getFilterValsFromProps([[{}], [{}]], featureMetaNum)).toEqual([
    [1, undefined],
    [undefined, 5],
  ]);
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
