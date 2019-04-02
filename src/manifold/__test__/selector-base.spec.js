// @noflow
import {
  getRawSegmentIds,
  getSegmentOrdering,
  getGeoPositions,
} from '../selectors/base';
import {FEATURE_TYPE} from 'packages/mlvis-common/constants';

const TEST_STATE = {
  nClusters: 5,
  segmentGroups: [[3, 4], [0]],
  featureTypes: {
    [FEATURE_TYPE.GEO]: [['lng1', 'lat1'], ['lng2', 'lat2']],
  },
};

test('selector: base/getRawSegmentIds', () => {
  expect(getRawSegmentIds(TEST_STATE)).toEqual([0, 1, 2, 3, 4]);
});

test('selector: base/getSegmentOrdering', () => {
  expect(getSegmentOrdering(TEST_STATE)).toEqual([1, 2, 0, 3, 4]);
});

test('selector: base/getGeoPositions', () => {
  const getGeoPositionsFunc = getGeoPositions(TEST_STATE);
  const obj = {
    lng1: 1,
    lng2: 2,
    lat1: 3,
    lat2: 4,
  };
  expect(getGeoPositionsFunc(obj)).toEqual([[1, 3], [2, 4]]);
});
