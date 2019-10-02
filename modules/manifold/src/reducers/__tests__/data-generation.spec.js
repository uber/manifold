import {METRIC} from '../../constants';
import {handleUpdateMetric} from '../data-generation';

test('reducers: data-generation/handleUpdateMetric', () => {
  const data2 = {
    fields: [
      {name: 'uuid'},
      {name: 'feature1'},
      {name: '@pred:model_0_class_0'},
      {name: '@pred:model_0_class_1'},
      {name: '@groundTruth'},
      {name: '@score:model_0'},
    ],
    columns: [
      ['uuid_0', 'uuid_1'],
      [1, 2],
      [0.1, 0.6],
      [0.9, 0.4],
      ['cat2', 'cat1'],
      [undefined, undefined],
    ],
  };
  const columnTypeRanges2 = {
    yPred: [2, 4],
    yTrue: [4, 5],
    score: [5, 6],
  };
  const meta2 = {
    nModels: 1,
    nClasses: 2,
    classLabels: ['cat1', 'cat2'],
  };
  const state2 = {
    data: data2,
    columnTypeRanges: columnTypeRanges2,
    modelsMeta: meta2,
  };
  const stateOut2 = handleUpdateMetric(state2, {
    payload: METRIC.LOG_LOSS,
  });

  expect(Array.from(stateOut2.data.columns[5])).toMatchObject([
    expect.any(Number),
    expect.any(Number),
  ]);
  // check scores are updated
  expect(stateOut2.data.columns[5]).not.toEqual(state2.data.columns[5]);
  // check creating new object
  expect(stateOut2).not.toBe(state2);
});
