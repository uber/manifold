// @noflow
import {
  isValidSegmentGroups,
  filterData,
  absoluteError,
  computeSortedOrder,
} from '../utils';

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

test('utils: computeSortedOrder', () => {
  const arr1 = [{a: 5}, {a: 3}, {a: 1}, {a: 4}, {a: 2}];
  const order1 = computeSortedOrder(arr1, d => d.a);

  expect(order1).toEqual([2, 4, 1, 3, 0]);
});
