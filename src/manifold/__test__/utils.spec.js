import {
  isValidSegmentGroups,
  filterData,
  absoluteError,
  logLoss,
  computeSortedOrder,
  updateSegmentGroups,
  isValidFilterVals,
  getSegmentFiltersFromValues,
  getFilterValsFromProps,
  registerExternalReducers,
} from '../utils';
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

test('utils: filterData', () => {
  const arr = [{a: 1}, {a: 2}, {a: 3}, {a: 4}, {a: 5}];
  expect(
    filterData(arr, {
      key: 'a',
      type: 'range',
      value: [2, 4],
    })
  ).toEqual([1, 2, 3]);
});

test('utils: absoluteError', () => {
  const targets1 = [1, 2, 3];
  const predictions1 = [[5], [4], [3]];
  const error1 = absoluteError(targets1, predictions1);

  expect(Array.from(error1)).toEqual([4, 2, 0]);
});

test('utils: logLoss', () => {
  const targets1 = ['true', 'false', 'true'];
  const predictions1 = [[0.1, 0.9], [0.1, 0.9], [0.5, 0.5]];
  const labels1 = ['false', 'true'];
  const error1 = logLoss(targets1, predictions1, labels1);
  const expectedError1 = [0.11, 2.3, 0.69];

  Array.from(error1).forEach((d, i) => {
    expect(d).toBeCloseTo(expectedError1[i]);
  });
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

const featureMeta1 = {
  name: 'feature_cat',
  type: FEATURE_TYPE.CATEGORICAL,
  domain: [1, 3, 5],
};
const featureMeta2 = {
  name: 'feature_num',
  type: FEATURE_TYPE.NUMERICAL,
  domain: [1, 5],
};
const filter1_1 = {
  key: 'feature_cat',
  type: FILTER_TYPE.INCLUDE,
  value: [1],
};
const filter1_2 = {
  key: 'feature_cat',
  type: FILTER_TYPE.INCLUDE,
  value: [5],
};
const filter2_1 = {
  key: 'feature_num',
  type: FILTER_TYPE.RANGE,
  value: [1, 2],
};
const filter2_2 = {
  key: 'feature_num',
  type: FILTER_TYPE.RANGE,
  value: [4, 5],
};

test('utils: isValidFilterVals', () => {
  expect(isValidFilterVals([[1], [5]], featureMeta1)).toBeTruthy();
  expect(isValidFilterVals([[1], [1]], featureMeta1)).toBeFalsy();
  expect(isValidFilterVals([[], [1]], featureMeta1)).toBeFalsy();
  expect(isValidFilterVals([[1, 2], [4, 5]], featureMeta2)).toBeTruthy();
  expect(isValidFilterVals([[0, 2], [4, 5]], featureMeta2)).toBeFalsy();
  expect(isValidFilterVals([[1, 2], [4]], featureMeta2)).toBeFalsy();
});

test('utils: getSegmentFiltersFromValues', () => {
  expect(getSegmentFiltersFromValues([[1], [5]], featureMeta1)).toEqual([
    [filter1_1],
    [filter1_2],
  ]);
  expect(getSegmentFiltersFromValues([[1, 2], [4, 5]], featureMeta2)).toEqual([
    [filter2_1],
    [filter2_2],
  ]);
});

test('utils: getFilterValsFromProps', () => {
  expect(
    getFilterValsFromProps([[filter1_1], [filter1_2]], featureMeta1)
  ).toEqual([[1], [5]]);
  expect(getFilterValsFromProps([[{}], [{}]], featureMeta1)).toEqual([[], []]);
  expect(
    getFilterValsFromProps([[filter2_1], [filter2_2]], featureMeta2)
  ).toEqual([[1, 2], [4, 5]]);
  expect(getFilterValsFromProps([[{}], [{}]], featureMeta2)).toEqual([
    [1, undefined],
    [undefined, 5],
  ]);
});

test('utils: registerExternalReducers', () => {
  const reducer = registerExternalReducers({a: state => state + 1});
  expect(reducer({a: 3, b: 4})).toEqual({a: 4, b: 4});
});
