import {
  getDataPerformance,
  getClusteringInput,
  getDataIdsInSegmentsUnsorted,
  getModelPerfHistogramsUnsorted,
  getModelPerfHistograms,
  getDataIdsInSegments,
} from '../selectors/compute';
import {METRIC} from '../constants';
import {dotRange} from 'packages/mlvis-common/utils';

const yPred1 = [[{predict: 10}], [{predict: 30}]];
const yPred2 = [
  [{cat1: 0.1, cat2: 0.5, cat3: 0.4}, {cat1: 0.6, cat2: 0.3, cat3: 0.1}],
];
const yTrue1 = [20];
const yTrue2 = ['cat2', 'cat1'];
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

test('selector: compute/getDataPerformance', () => {
  const perf1 = getDataPerformance.resultFunc(yPred1, yTrue1, meta1);
  const perf2 = getDataPerformance.resultFunc(yPred2, yTrue2, meta2);

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

test('selector: compute/getClusteringInput', () => {
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
    perfArr1,
    {nClasses: 1},
    [],
    METRIC.ACTUAL
  );

  expect(input1).toMatchObject([[expect.any(Number), expect.any(Number)]]);
  expect(input1).toEqual([[2, 4]]);
  expect(input2).toMatchObject([[expect.any(Number)]]);
  expect(input2).toEqual([[8]]);
  expect(input3).toMatchObject([[expect.any(Number), expect.any(Number)]]);
  expect(input3).toEqual([[1, 3]]);
});

test('selector: compute/getDataIdsInSegmentsUnsorted', () => {
  const nClusters = 3;
  const result = getDataIdsInSegmentsUnsorted.resultFunc(
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

test('selector: compute/getModelPerfHistogramsUnsorted, getModelPerfHistograms', () => {
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
  const expOutUnsorted = {
    numDataPoints: expect.any(Number),
    dataIds: expect.arrayContaining([expect.any(Number)]),
    data: expect.arrayContaining([
      expect.objectContaining({
        density: expect.anything(), //expect.arrayContaining([expect.any(Array)]),
        percentiles: expect.arrayContaining([expect.any(Number)]),
      }),
    ]),
  };
  const expOut = {
    ...expOutUnsorted,
    segmentId: expect.any(Number),
  };
  const resultUnsorted = getModelPerfHistogramsUnsorted.resultFunc(
    perfArr,
    idsInSegments,
    {nModels: nModels},
    METRIC.PERFORMANCE
  );

  resultUnsorted.forEach(segment => {
    expect(segment).toMatchObject(expOutUnsorted);
    segment.data.forEach(model => {
      expect(model.density.length).toBe(2);
      // density[0]: counts; density[1]: binEdges. binEdges.length = counts.length + 1
      expect(model.density[0].length + 1).toEqual(model.density[1].length);
    });
  });

  const order = [3, 1, 0, 2];
  const result = getModelPerfHistograms.resultFunc(resultUnsorted, order);

  result.forEach(segment => {
    expect(segment).toMatchObject(expOut);
    segment.data.forEach(model => {
      expect(model.density.length).toBe(2);
      expect(model.density[0].length + 1).toEqual(model.density[1].length);
    });
  });
});

test('selector: compute/getDataIdsInSegments', () => {
  const idsInSegmentsUnsorted = [[1, 2, 3, 4], [5, 6, 7], [8, 9]];
  const sortedOrder = [2, 0, 1];
  const resultAuto = getDataIdsInSegments.resultFunc(
    idsInSegmentsUnsorted,
    false,
    sortedOrder
  );
  const resultManual = getDataIdsInSegments.resultFunc(
    idsInSegmentsUnsorted,
    true,
    sortedOrder
  );
  expect(resultAuto).toEqual([[8, 9], [1, 2, 3, 4], [5, 6, 7]]);
  // regression test: T3563191
  expect(resultAuto).not.toBe(idsInSegmentsUnsorted);
  expect(resultManual).toEqual([[1, 2, 3, 4], [5, 6, 7], [8, 9]]);
  expect(resultManual).toBe(idsInSegmentsUnsorted);
});
