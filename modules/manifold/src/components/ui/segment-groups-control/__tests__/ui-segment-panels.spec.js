import {
  updateSegmentGroups,
  isValidFilterVals,
  getSegmentFiltersFromValues,
  getFilterValsFromProps,
} from '../../segment-filters-control/utils';
import {FEATURE_TYPE, FILTER_TYPE} from '@mlvis/mlvis-common/constants';

test('utils: updateSegmentGroups', () => {
  // deselect segment 1 from group 0
  expect(updateSegmentGroups([[0, 1], [2, 3]], 0, 1)).toEqual([[0], [2, 3]]);
  // move segment 2 from group 1 to group 0
  expect(updateSegmentGroups([[0, 1], [2, 3]], 0, 2)).toEqual([[0, 1, 2], [3]]);
  // no action if segment 3 is the only segment in group 1 when moving it to group 0
  expect(updateSegmentGroups([[0, 1, 2], [3]], 0, 3)).toEqual([[0, 1, 2], [3]]);
  // no action if segment 3 is the only segment in group 1 when deselecting from segment 1
  expect(updateSegmentGroups([[0, 1, 2], [3]], 1, 3)).toEqual([[0, 1, 2], [3]]);
  // add a segment that originally belonged to neither group
  expect(updateSegmentGroups([[0, 1], [3]], 0, 2)).toEqual([[0, 1, 2], [3]]);
  // no action if updating will cause one of the groups to become empty
  expect(updateSegmentGroups([[0, 1], [2]], 0, 2)).toEqual([[0, 1], [2]]);
  // sanity check
  expect(updateSegmentGroups([[0, 1], [2, 3]])).toEqual([[0, 1], [2, 3]]);
});

const featureMetaCat = {
  name: 'feature_cat',
  tableFieldIndex: 1,
  type: FEATURE_TYPE.CATEGORICAL,
  domain: [1, 3, 5],
};
const featureMetaNum = {
  name: 'feature_num',
  tableFieldIndex: 2,
  type: FEATURE_TYPE.NUMERICAL,
  domain: [1, 5],
};
const filterCat1 = {
  name: 'feature_cat',
  key: 0,
  type: FILTER_TYPE.INCLUDE,
  value: [1],
};
const filterCat2 = {
  name: 'feature_cat',
  key: 0,
  type: FILTER_TYPE.INCLUDE,
  value: [5],
};
const filterNum1 = {
  name: 'feature_num',
  key: 1,
  type: FILTER_TYPE.RANGE,
  value: [1, 2],
};
const filterNum2 = {
  name: 'feature_num',
  key: 1,
  type: FILTER_TYPE.RANGE,
  value: [4, 5],
};

test('utils: getSegmentFiltersFromValues', () => {
  expect(getSegmentFiltersFromValues([[1], [5]], featureMetaCat)).toEqual([
    [filterCat1],
    [filterCat2],
  ]);
  expect(getSegmentFiltersFromValues([[1, 2], [4, 5]], featureMetaNum)).toEqual(
    [[filterNum1], [filterNum2]]
  );
});

test('utils: isValidFilterVals', () => {
  expect(isValidFilterVals([[1], [5]], featureMetaCat)).toBeTruthy();
  expect(isValidFilterVals([[1], [1]], featureMetaCat)).toBeFalsy();
  expect(isValidFilterVals([[], [1]], featureMetaCat)).toBeFalsy();
  expect(isValidFilterVals([[1, 2], [4, 5]], featureMetaNum)).toBeTruthy();
  expect(isValidFilterVals([[0, 2], [4, 5]], featureMetaNum)).toBeFalsy();
  expect(isValidFilterVals([[1, 2], [4]], featureMetaNum)).toBeFalsy();
});

test('utils: getFilterValsFromProps', () => {
  expect(
    getFilterValsFromProps([[filterCat1], [filterCat2]], featureMetaCat)
  ).toEqual([[1], [5]]);
  expect(getFilterValsFromProps([[{}], [{}]], featureMetaCat)).toEqual([
    [],
    [],
  ]);
  expect(
    getFilterValsFromProps([[filterNum1], [filterNum2]], featureMetaNum)
  ).toEqual([[1, 2], [4, 5]]);
  expect(getFilterValsFromProps([[{}], [{}]], featureMetaNum)).toEqual([
    [1, undefined],
    [undefined, 5],
  ]);
});
