import {
  dotRange,
  transposeData,
  binCount,
  computeHistogram,
  computeHistogramCat,
  computeDensity,
  computeModelsMeta,
  computeFeaturesMeta,
  isFeatureInvalid,
  computeDataType,
  computeFeatureType,
  computeFeatureMeta,
  computeSegmentedFeatureDistributions,
  computeSegmentedFeatureDistributionsNormalized,
  computeDivergence,
  logLoss,
  absoluteError,
} from '../utils';
import {FEATURE_TYPE, DATA_TYPE} from '../constants';
import {tensor} from '@tensorflow/tfjs-core';

test('utils: dotRange', () => {
  expect(dotRange(3)).toEqual([0, 1, 2]);
  expect(dotRange(1, 3)).toEqual([1, 2]);
});

test('utils: transposeData', () => {
  expect(transposeData([[1, 2], [3, 4], [5, 6]])).toEqual([
    [1, 3, 5],
    [2, 4, 6],
  ]);
});

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

  expect(Array.from(hist3)).toEqual([1, 2, 1, 2, 0]);
  expect(Array.from(binEdges3)).toEqual(arr1);

  expect(Array.from(hist4)).toEqual([1, 2, 1, 2]);
  expect(Array.from(categories4)).toEqual(['A', 'B', 'C', 'D']);
});

test('utils: computeDensity', () => {
  const [hist, binEdges] = computeDensity([0, 1, 2, 3, 4, 5], 5);
  expect(Array.from(hist)).toEqual([0.2, 0.2, 0.2, 0.2, 0.4]);
  expect(Array.from(binEdges)).toEqual([0, 1, 2, 3, 4, 5]);
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

test('utils: isFeatureInvalid', () => {
  const arr1 = dotRange(101).reduce((acc, i) => {
    acc.push('a' + String(i));
    return acc;
  }, []);

  expect(isFeatureInvalid(arr1)).toBeTruthy();
});

test('utils: computeDataType', () => {
  const arr1 = dotRange(11);
  const arr2 = dotRange(5).map(d => d + 0.1);
  const arr3 = dotRange(2).map(i => 'a' + i);
  const arr4 = [undefined, null, NaN, ''];
  const arr5 = arr4.concat([true]);

  expect(computeDataType(arr1)).toBe(DATA_TYPE.INTEGER);
  expect(computeDataType(arr2)).toBe(DATA_TYPE.REAL);
  expect(computeDataType(arr3)).toBe(DATA_TYPE.STRING);
  expect(computeDataType(arr4)).toBe(null);
  expect(computeDataType(arr5)).toBe(DATA_TYPE.BOOLEAN);
});

test('utils: computeFeatureType', () => {
  const arr1 = dotRange(11).reduce((acc, i) => {
    return acc.concat([1, 2, 3, 4, 5, 6, 7]);
  }, []);
  const arr2 = dotRange(2).reduce((acc, i) => {
    acc.push('a' + String(i));
    return acc;
  }, []);
  const arr3 = dotRange(101);
  const arr4 = [1, 1, 2, 'a'];

  expect(computeFeatureType('catFeature', arr1)).toBe(FEATURE_TYPE.CATEGORICAL);
  expect(computeFeatureType('catFeature', arr2)).toBe(FEATURE_TYPE.CATEGORICAL);
  expect(computeFeatureType('numFeature', arr3)).toBe(FEATURE_TYPE.NUMERICAL);
  expect(computeFeatureType('numFeature', arr4)).toBe(FEATURE_TYPE.CATEGORICAL);
  expect(computeFeatureType('feature_lat', [])).toBe(FEATURE_TYPE.GEO);
  expect(computeFeatureType('feature_hexagon', [])).toBe(FEATURE_TYPE.GEO);
});

test('utils: computeFeatureMeta', () => {
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
  const arr5 = [1, 1, 2, 'a'];

  expect(computeFeatureMeta('catFeature', arr1)).toEqual({
    name: 'catFeature',
    type: FEATURE_TYPE.CATEGORICAL,
    dataType: DATA_TYPE.INTEGER,
    domain: [1, 2, 3, 4, 5, 6, 7],
  });
  expect(computeFeatureMeta('catFeature', arr2)).toEqual({
    name: 'catFeature',
    type: FEATURE_TYPE.CATEGORICAL,
    dataType: DATA_TYPE.STRING,
    domain: ['a0', 'a1'],
  });
  expect(computeFeatureMeta('nullFeature', arr3)).toEqual({
    name: 'nullFeature',
    type: null,
    dataType: null,
    domain: null,
  });
  expect(computeFeatureMeta('uuid', arr3)).toEqual({
    name: 'uuid',
    type: FEATURE_TYPE.UUID,
    dataType: DATA_TYPE.STRING,
    domain: null,
  });
  expect(computeFeatureMeta('numFeature', arr4)).toEqual({
    name: 'numFeature',
    type: FEATURE_TYPE.NUMERICAL,
    dataType: DATA_TYPE.INTEGER,
    domain: dotRange(101),
  });
  expect(computeFeatureMeta('hybridFeature', arr5)).toEqual({
    name: 'hybridFeature',
    type: FEATURE_TYPE.CATEGORICAL,
    // Todo: only checking the first element for data type for now. Might need to change in the future
    dataType: DATA_TYPE.INTEGER,
    domain: [1, 2, 'a'],
  });
});

test('utils: computeModelsMeta', () => {
  const yPred1 = [[{predict: 10}], [{predict: 30}]];
  const yPred2 = [
    [{cat1: 0.1, cat2: 0.5, cat3: 0.4}, {cat1: 0.6, cat2: 0.3, cat3: 0.1}],
  ];
  const meta1 = {
    nModels: 2,
    nClasses: 1,
    classLabels: ['predict'],
  };
  const meta2 = {
    nModels: 1,
    nClasses: 3,
    classLabels: ['cat1', 'cat2', 'cat3'],
  };
  expect(computeModelsMeta(yPred1)).toEqual(meta1);
  expect(computeModelsMeta(yPred2)).toEqual(meta2);
});

test('utils: computeFeaturesMeta', () => {
  const featureVals1 = [0, 1, 2, 3, 4, 5];
  const featureVals2 = ['A', 'B', 'B', 'C', 'D', 'D'];
  const featureData = dotRange(6).map(i => ({
    feature1: featureVals1[i],
    feature2: featureVals2[i],
  }));
  const resultArr = computeFeaturesMeta(featureData, 5);
  const [result0, result1] = resultArr;

  expect(resultArr.length).toBe(2);
  expect(result0).toMatchObject({
    name: 'feature1',
    type: FEATURE_TYPE.NUMERICAL,
  });
  expect(result1).toMatchObject({
    name: 'feature2',
    type: FEATURE_TYPE.CATEGORICAL,
  });
  expect(Array.from(result0.domain)).toEqual([0, 1, 2, 3, 4, 5]);
  expect(Array.from(result1.domain)).toEqual(['A', 'B', 'C', 'D']);
});

test('utils: computeSegmentedFeatureDistributions', () => {
  const [T, C] = computeSegmentedFeatureDistributions(
    FEATURE_TYPE.CATEGORICAL,
    [1, 2, 3, 4],
    [[1, 1, 3, 3, 4, 4, 4], [2, 3, 3]]
  );
  expect(Array.from(T)).toEqual([2, 0, 2, 3]);
  expect(Array.from(C)).toEqual([0, 1, 2, 0]);
});

test('utils: computeSegmentedFeatureDistributionsNormalized', () => {
  const [normT, normC] = computeSegmentedFeatureDistributionsNormalized([
    [2, 0, 2, 3],
    [0, 1, 2, 0],
  ]);
  expect(normT.length).toEqual(4);
  expect(normC.length).toEqual(4);
});

test('utils: computeDivergence', () => {
  const divergence1 = computeDivergence([[1, 2, 3, 4], [4, 3, 2, 1]]);
  const divergence2 = computeDivergence([[1, 2, 3, 4], [1, 2, 3, 3]]);
  expect(divergence1).toBeGreaterThan(divergence2);
});

test('utils: absoluteError', () => {
  const targets1 = [1, 2, 3];
  const predictions1 = [[5], [4], [3]];
  const error1 = absoluteError(targets1, predictions1);

  expect(Array.from(error1)).toEqual([4, 2, 0]);
});

test('utils: logLoss', () => {
  const targets1 = ['true', 'false', 'true'];
  const predictions1 = [[0.1, 0.1, 0.5], [0.9, 0.9, 0.5]];
  const labels1 = ['false', 'true'];
  const error1 = logLoss(targets1, predictions1, labels1);
  const expectedError1 = [0.11, 2.3, 0.69];

  Array.from(error1).forEach((d, i) => {
    expect(d).toBeCloseTo(expectedError1[i]);
  });
});
