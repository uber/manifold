import {
  initCentroids,
  assignClusterId,
  fillEmptyClusters,
  assign,
  updateCentroids,
  computeClusters,
} from '../utils';
import {tensor, scalar} from '@tensorflow/tfjs-core';

test('kmeans: initCentroids', () => {
  const X = tensor([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]);
  expect(initCentroids(X, 2).shape).toEqual([2, 3]);
});

test('kmeans: assign', () => {
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

test('kmeans: fillEmptyClusters', () => {
  const distances1 = tensor([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
  const min1 = fillEmptyClusters(distances1);
  expect(Array.from(min1.dataSync())).toEqual([1, 2, 0, 0]);
});

test('kmeans: updateCentroids', () => {
  const samples1 = tensor([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 1]);
  const indices1 = tensor([0, 0, 1, 2, 1, 2, 1, 2, 1, 2]);
  const centroids1 = updateCentroids(samples1, indices1, 3);

  expect(centroids1.shape).toEqual([3, 1]);
  expect(Array.from(centroids1.dataSync())).toEqual([1.5, 6, 7]);
});

test('kmeans: assignToNearest', () => {
  const samples1 = tensor([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 1]);
  const centroids1 = tensor([0, 5.5, 10], [3, 1]);
  const nearest1 = assignClusterId(samples1, centroids1, 3);

  expect(nearest1.shape).toEqual([10]);
  const nearest1Arr = Array.from(nearest1.dataSync());
  expect(nearest1Arr).toEqual([0, 0, 1, 1, 1, 1, 1, 2, 2, 2]);
});

test('kmeans: computeClusters', () => {
  const data1 = [[0, 1], [0, 1], [2, 3], [2, 3], [2, 3], [4, 5]];
  const data2 = [[0, 0, 2, 2, 2, 4], [1, 1, 3, 3, 3, 5]];
  const resultArr1 = computeClusters(data1, 3);
  const resultArr2 = computeClusters(data2, 3, true);

  expect(resultArr1.length).toBe(6);
  resultArr1.forEach(ele => {
    expect(typeof ele).toBe('number');
    expect(ele).not.toBeNaN();
  });
  expect(resultArr2.length).toBe(6);
  resultArr2.forEach(ele => {
    expect(typeof ele).toBe('number');
    expect(ele).not.toBeNaN();
  });
  // todo: should check equality of resultArr[0] and resultArr[1], etc
});
