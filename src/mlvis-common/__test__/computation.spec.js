// @noflow
import {
  dotRange,
  binCount,
  computeHistogram,
  computeHistogramCat,
  computeFeatureMeta,
} from '../utils';
import {FEATURE_TYPE} from '../constants';
import {tensor} from '@tensorflow/tfjs';

test('utils: binCount', () => {
  const arr = tensor([0, 0, 2, 1, 2, 2]);
  const bins = tensor([0, 1, 2]);

  expect(Array.from(binCount(arr, bins).dataSync())).toEqual([2, 1, 3]);
});

test('utils: computeHistogram', () => {
  const arr1 = [0, 1, 2, 3, 4, 5];
  const arr2 = [0, 1, 1, 2, 3, 3];
  const arr3 = ['A', 'B', 'B', 'C', 'D', 'D'];

  /* eslint-disable no-unused-vars */
  const [hist1, binEdges1] = computeHistogram(arr1, 3);
  const [hist2, binEdges2] = computeHistogram(arr1, 5);
  const [hist3, binEdges3] = computeHistogram(arr2, arr1);
  const [hist4, categories4] = computeHistogram(arr3);
  /* eslint-enable no-unused-vars */

  expect(Array.from(hist1)).toEqual([2, 2, 2]);
  expect(Array.from(hist2)).toEqual([1, 1, 1, 1, 2]);
  expect(Array.from(binEdges2)).toEqual([0, 1, 2, 3, 4, 5]);
  // todo: add bin precision so that this test passes
  // expect(Array.from(hist3)).toEqual([1, 2, 1, 2, 0]);

  expect(Array.from(hist4)).toEqual([1, 2, 1, 2]);
  expect(Array.from(categories4)).toEqual(['A', 'B', 'C', 'D']);
});

test('utils: computeHistogramCat', () => {
  const arr1 = [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1];
  const arr2 = [1, 0];

  const [hist1, binEdges1] = computeHistogramCat(arr1);
  const [hist2, binEdges2] = computeHistogramCat(arr1, arr2);

  expect(Array.from(hist1)).toEqual([7, 5]);
  expect(Array.from(binEdges1)).toEqual([0, 1]);
  expect(Array.from(hist2)).toEqual([5, 7]);
  expect(Array.from(binEdges2)).toEqual([1, 0]);
});

test('utils: computeFeatureType', () => {
  const arr1 = dotRange(11).reduce((acc, i) => {
    return acc.concat([1, 2, 3, 4, 5, 6, 7]);
  }, []);
  const arr2 = dotRange(2).reduce((acc, i) => {
    acc.push('a' + String(i));
    return acc;
  }, []);
  const arr3 = dotRange(101).reduce((acc, i) => {
    acc.push('a' + String(i));
    return acc;
  }, []);
  const arr4 = dotRange(101);

  expect(computeFeatureMeta(arr1)).toEqual({
    type: FEATURE_TYPE.CATEGORICAL,
    domain: [1, 2, 3, 4, 5, 6, 7],
  });
  expect(computeFeatureMeta(arr2)).toEqual({
    type: FEATURE_TYPE.CATEGORICAL,
    domain: ['a0', 'a1'],
  });
  expect(computeFeatureMeta(arr3)).toEqual({
    type: null,
    domain: null,
  });
  expect(computeFeatureMeta(arr4)).toEqual({
    type: FEATURE_TYPE.NUMERICAL,
    domain: dotRange(101),
  });
});
