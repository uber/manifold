// @noflow
import {
  getModelsMeta,
  getFeaturesMeta,
  getDataPerformance,
  getClusteringInput,
  getDataIdsInSegments,
  getModelPerfHistograms,
} from '../selectors/misc';
import {METRIC, FEATURE_TYPE} from '../constants';
import {dotRange} from '@uber/mlvis-common/utils';

const rawPred1 = [
  [{'@prediction:predict': 10, '@prediction:target': 20}],
  [{'@prediction:predict': 30, '@prediction:target': 40}],
];
const rawPred2 = [
  [
    {
      '@prediction:cat1': 0.1,
      '@prediction:cat2': 0.5,
      '@prediction:cat3': 0.4,
      '@prediction:target': 'cat2',
    },
    {
      '@prediction:cat1': 0.6,
      '@prediction:cat2': 0.3,
      '@prediction:cat3': 0.1,
      '@prediction:target': 'cat1',
    },
  ],
];

test('selector: misc/getModelsMeta', () => {
  expect(getModelsMeta.resultFunc(rawPred1, [{}])).toEqual({
    nModels: 2,
    nClasses: 1,
    classLabels: undefined,
  });

  expect(getModelsMeta.resultFunc(rawPred2, [{}])).toEqual({
    nModels: 1,
    nClasses: 3,
    classLabels: ['cat1', 'cat2', 'cat3'],
  });
});

test('selector: misc/getFeaturesMeta', () => {
  const featureVals1 = [0, 1, 2, 3, 4, 5];
  const featureVals2 = ['A', 'B', 'B', 'C', 'D', 'D'];
  const featureData = dotRange(6).map(i => ({
    feature1: featureVals1[i],
    feature2: featureVals2[i],
  }));
  const resultArr = getFeaturesMeta.resultFunc(featureData, 5);
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
  expect(Array.from(result0.histogram)).toEqual([1, 1, 1, 1, 2]);
  expect(Array.from(result0.domain)).toEqual([0, 1, 2, 3, 4, 5]);
  expect(Array.from(result1.histogram)).toEqual([1, 2, 1, 2]);
  expect(Array.from(result1.domain)).toEqual(['A', 'B', 'C', 'D']);
});

test('selector: misc/getDataPerformance', () => {
  const perf1 = getDataPerformance.resultFunc(rawPred1, {
    nClasses: 1,
    classLabels: [],
  });
  const perf2 = getDataPerformance.resultFunc(rawPred2, {
    nClasses: 2,
    classLabels: ['cat1', 'cat2', 'cat3'],
  });

  const expOut1 = {
    modelClass_0_0: expect.any(Number),
    model_0: expect.any(Number),
    modelClass_1_0: expect.any(Number),
    model_1: expect.any(Number),
  };
  const expOut2 = {
    modelClass_0_0: expect.any(Number),
    modelClass_0_1: expect.any(Number),
    modelClass_0_2: expect.any(Number),
    model_0: expect.any(Number),
  };

  expect(perf1[0]).toMatchObject(expOut1);
  for (let i = 0; i < 2; i++) {
    expect(perf2[i]).toMatchObject(expOut2);
  }

  expect(perf1.length).toBe(1);
  expect(isNaN(perf1[0].model_0)).toBeFalsy();
  expect(isNaN(perf1[0].model_1)).toBeFalsy();
  expect(perf1[0].model_0).toEqual(perf1[0].model_1);

  expect(perf2.length).toBe(2);
  expect(isNaN(perf2[0].model_0)).toBeFalsy();
  expect(perf2[0].model_0).toBeGreaterThan(perf2[1].model_0);
});

test('selector: misc/getClusteringInput', () => {
  const perfArr1 = [
    {
      modelClass_0_0: 1,
      model_0: 2,
      modelClass_1_0: 3,
      model_1: 4,
    },
  ];
  const perfArr2 = [
    {
      modelClass_0_0: 5,
      modelClass_0_1: 6,
      modelClass_0_2: 7,
      model_0: 8,
    },
  ];
  const input1 = getClusteringInput.resultFunc(
    perfArr1,
    {nClasses: 1},
    [],
    METRIC.PERFORMANCE
  );
  const input2 = getClusteringInput.resultFunc(
    perfArr2,
    {nClasses: 3},
    [],
    METRIC.PERFORMANCE
  );
  const input3 = getClusteringInput.resultFunc(
    perfArr2,
    {nClasses: 3},
    [],
    METRIC.ACTUAL
  );

  expect(input1).toMatchObject([[expect.any(Number), expect.any(Number)]]);
  expect(input2).toMatchObject([[expect.any(Number)]]);
  expect(input3).toMatchObject([[expect.any(Number), expect.any(Number)]]);
});

test('selector: misc/getDataIdsInSegments', () => {
  const nClusters = 3;
  const result = getDataIdsInSegments.resultFunc(
    [[1, 2], [3, 4], [5, 6], [7, 8]],
    null,
    nClusters,
    []
  );
  expect(result.length).toBe(nClusters);
  result.forEach(clusterArr => {
    expect(result.length).toBeGreaterThan(0);
  });
});

test('selector: misc/getModelPerfHistograms', () => {
  // todo: test segment id ordering after segments reordering
  const numData = 20;
  const nModels = 2;
  // todo: use similar logic to generate data and test end-to-end
  const perfArr = dotRange(numData).map(() => ({
    modelClass_0_0: Math.random(),
    model_0: Math.random(),
    modelClass_1_0: Math.random(),
    model_1: Math.random(),
  }));
  const idsInSegments = [
    [3, 8, 16, 13],
    [19],
    [0, 1, 2, 4, 5, 6],
    [7, 9, 10, 11, 12, 14, 15, 17, 18],
  ];
  const expOut = {
    segmentId: expect.any(String),
    numDataPoints: expect.any(Number),
    dataIds: expect.arrayContaining([expect.any(Number)]),
    modelsPerformance: expect.arrayContaining([
      expect.objectContaining({
        modelId: expect.any(String),
        modelName: expect.any(String),
        density: expect.anything(), //expect.arrayContaining([expect.any(Array)]),
        percentiles: expect.arrayContaining([expect.any(Number)]),
      }),
    ]),
  };
  const result = getModelPerfHistograms.resultFunc(
    perfArr,
    idsInSegments,
    {nModels: nModels},
    METRIC.PERFORMANCE
  );
  result.forEach(segment => {
    expect(segment).toMatchObject(expOut);
    segment.modelsPerformance.forEach(model => {
      expect(model.density.length).toBe(2);
      expect(model.density[0].length).toEqual(model.density[1].length);
    });
  });
});
