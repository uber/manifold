import {getSegmentIds, getSegmentOrdering} from '../selectors/base';

const TEST_STATE = {
  nClusters: 5,
  segmentGroups: [[3, 4], [0]],
};

test('selector: base/getSegmentIds', () => {
  expect(getSegmentIds(TEST_STATE)).toEqual([0, 1, 2, 3, 4]);
});

test('selector: base/getSegmentOrdering', () => {
  expect(getSegmentOrdering(TEST_STATE)).toEqual([1, 2, 0, 3, 4]);
});
