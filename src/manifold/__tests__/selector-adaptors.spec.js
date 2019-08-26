// @noflow
import {
  getRawDataRange,
  getDensityRange,
  getModelIds,
  getFeatures,
  getDisplayMetric,
} from '../selectors/adaptors';

// Use `.resultFunc` to test individual selector logic without having to mock dependency selectors
// https://github.com/reduxjs/reselect#q-how-do-i-test-a-selector
test('selector: adapter/getRawSegmentIds', () => {
  const perfBySegment = [
    {data: [{percentiles: [-10, 0, 5]}, {percentiles: [-1, 0, 1]}]},
    {data: [{percentiles: [-1, 0, 10]}, {percentiles: [-5, 0, 1]}]},
  ];
  expect(getRawDataRange.resultFunc(perfBySegment)).toEqual([-10, 10]);
});

test('selector: adapter/getDensityRange', () => {
  const perfBySegment = [
    {
      data: [{density: [[1, 6, 5], []]}, {density: [[2, 3, 4], []]}],
      segmentId: 1,
    },
    {
      data: [{density: [[4, 2, 5], []]}, {density: [[1, 3, 7], []]}],
      segmentId: 0,
    },
  ];
  expect(getDensityRange.resultFunc(perfBySegment)).toEqual([[0, 7], [0, 6]]);
});

test('selector: adapter/getModelIds', () => {
  const perfBySegment = [{data: [{}, {}, {}]}, {data: [{}, {}, {}]}];
  expect(getModelIds.resultFunc(perfBySegment)).toEqual([0, 1, 2]);
});

test('selector: adapter/getFeatures', () => {
  const rawFeatures = [{divergence: 0}, {divergence: 1}, {divergence: 2}];
  const features = getFeatures.resultFunc(rawFeatures, 0.5);
  expect(features.length).toBe(2);
});

test('selector: adapter/getDisplayMetric', () => {
  expect(getDisplayMetric.resultFunc('actual', {nClasses: 2})).toEqual(
    'actual'
  );
  expect(getDisplayMetric.resultFunc('performance', {nClasses: 1})).toEqual(
    'squared_error'
  );
  expect(getDisplayMetric.resultFunc('performance', {nClasses: 2})).toEqual(
    'log_loss'
  );
});
