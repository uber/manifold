// @noflow
import {getRawSegmentIds, getSegmentOrdering} from '../selectors/base';

const TEST_STATE = {
  nClusters: 5,
  segmentGroups: [[3, 4], [0]],
};

const TEST_PROPS = {};

test('selector: base/getRawSegmentIds', () => {
  expect(getRawSegmentIds(TEST_STATE, TEST_PROPS)).toEqual([0, 1, 2, 3, 4]);
});

test('selector: base/getSegmentOrdering', () => {
  expect(getSegmentOrdering(TEST_STATE, TEST_PROPS)).toEqual([1, 2, 0, 3, 4]);
});
