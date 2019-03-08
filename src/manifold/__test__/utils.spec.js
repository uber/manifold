// @noflow
import {
  isValidSegmentGroups,
  filterData,
  assignClusterId,
  fillEmptyClusters,
  assign,
  updateCentroids,
  computeClusters,
  absoluteError,
} from '../utils';
import {tensor, scalar} from '@tensorflow/tfjs-core';

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

test('utils: assign', () => {
  const X1 = tensor([1, 2, 3, 4, 5, 6]);
  const indices1 = tensor([0, 2]).toInt();
  const values1 = tensor([100, 300]);
  const assigned1 = assign(X1, indices1, values1);
  expect(Array.from(assigned1.dataSync())).toEqual([100, 2, 300, 4, 5, 6]);

  const X2 = tensor([1, 2, 3, 4, 5, 6]);
  const indices2 = tensor([0, 2]).toInt();
  const values2 = scalar(100);
  const assigned2 = assign(X2, indices2, values2);
  expect(Array.from(assigned2.dataSync())).toEqual([100, 2, 100, 4, 5, 6]);

  const X3 = tensor([1, 2, 3, 4, 5, 6]);
  const indices3 = tensor([]).toInt();
  const values3 = scalar(100);
  const assigned3 = assign(X3, indices3, values3);
  expect(Array.from(assigned3.dataSync())).toEqual([1, 2, 3, 4, 5, 6]);
  expect(assigned3).not.toBe(X3);
});

test('utils: fillEmptyClusters', () => {
  const distances1 = tensor([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
  const min1 = fillEmptyClusters(distances1);
  expect(Array.from(min1.dataSync())).toEqual([1, 2, 0, 0]);
});

test('utils: updateCentroids', () => {
  const samples1 = tensor([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 1]);
  const indices1 = tensor([0, 0, 1, 2, 1, 2, 1, 2, 1, 2]);
  const centroids1 = updateCentroids(samples1, indices1, 3);

  expect(centroids1.shape).toEqual([3, 1]);
  expect(Array.from(centroids1.dataSync())).toEqual([1.5, 6, 7]);
});

test('utils: assignToNearest', () => {
  const samples1 = tensor([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 1]);
  const centroids1 = tensor([0, 5.5, 10], [3, 1]);
  const nearest1 = assignClusterId(samples1, centroids1, 3);

  expect(nearest1.shape).toEqual([10]);
  const nearest1Arr = Array.from(nearest1.dataSync());
  expect(nearest1Arr).toEqual([0, 0, 1, 1, 1, 1, 1, 2, 2, 2]);
});

test('utils: computeClusters', () => {
  const data1 = [[0, 1], [0, 1], [2, 3], [2, 3], [2, 3], [4, 5]];
  const resultArr = computeClusters(data1, 3);

  expect(resultArr.length).toBe(6);
  resultArr.forEach(ele => {
    expect(typeof ele).toBe('number');
    expect(ele).not.toBeNaN();
  });
  // todo: should check equality of resultArr[0] and resultArr[1], etc
});

test('utils: absoluteError', () => {
  const targets1 = [1, 2, 3];
  const predictions1 = [[5], [4], [3]];
  const error1 = absoluteError(targets1, predictions1);

  expect(Array.from(error1)).toEqual([4, 2, 0]);
});
