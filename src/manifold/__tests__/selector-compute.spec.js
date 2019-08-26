import {
  getDataIdsInSegmentsUnsorted,
  getModelPerfHistogramsUnsorted,
  getModelPerfHistograms,
  getDataIdsInSegments,
  getSegmentedCatNumFeatures,
} from '../selectors/compute';
import {dotRange} from 'packages/mlvis-common/utils';
import {FEATURE_TYPE} from 'packages/mlvis-common/constants';

test('selector: compute/getDataIdsInSegmentsUnsorted', () => {
  const nClusters = 3;
  const result = getDataIdsInSegmentsUnsorted.resultFunc(
    {columns: [[1, 2, 3, 4, 5], [5, 6, 7, 8, 9]]},
    {columns: []},
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
  const perfArr = dotRange(nModels).map(() =>
    dotRange(numData).map(() => Math.random())
  );
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
    {columns: perfArr},
    idsInSegments
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

test('selector: compute/getSegmentedCatNumFeatures', () => {
  const x = {
    fields: [
      {
        name: 'feature1',
        type: FEATURE_TYPE.NUMERICAL,
        tableFieldIndex: 2,
        domain: [1, 3, 5, 7],
      },
      {name: 'feature2', type: FEATURE_TYPE.GEO, tableFieldIndex: 3},
      {
        name: 'feature3',
        type: FEATURE_TYPE.CATEGORICAL,
        tableFieldIndex: 4,
        domain: [1, 2],
      },
    ],
    columns: [
      [1, 2, 3, 4, 5, 6, 7, 8],
      [11, 12, 13, 14, 15, 16, 17, 18],
      [1, 1, 2, 2, 1, 1, 2, 2],
    ],
  };
  const columnTypeRanges = {x: [1, 4]};
  const idsInGroups = [[1, 2, 3, 4], [5, 6, 7]];
  const result = getSegmentedCatNumFeatures.resultFunc(
    x,
    columnTypeRanges,
    idsInGroups
  );
  expect(result).toMatchObject([{name: 'feature1'}, {name: 'feature3'}]);
});
