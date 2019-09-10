import {FEATURE_TYPE, FILTER_TYPE} from 'packages/mlvis-common/constants';

/**
 * update segment grouping when user (de)select a segment from either group
 * @param {array} groups - the input segment group before updating
 * @param {number} groupId - the source segment group
 * @param {number} segmentId - the segment Id being (de)selected
 * @return {array} updated segment groups
 */
export const updateSegmentGroups = (groups, groupId, segmentId) => {
  if ((!groupId && groupId !== 0) || (!segmentId && segmentId !== 0)) {
    return groups;
  }
  // clone segment group in case the result will be used to trigger re-render
  const updatedGroups = groups.slice();
  // deselect a segment from the current group
  if ((groups[groupId] || []).includes(segmentId)) {
    if (groups[groupId].length > 1) {
      // remove segment from current group if it is not the only segment left
      updatedGroups[groupId] = groups[groupId].filter(id => id !== segmentId);
    }
  } else {
    // remove from other groups, segment only allows in one group
    groups.forEach((group, idx) => {
      if (
        // if the group is not the source group users interacted with
        idx !== groupId &&
        // and it includes the segment Id selected by the user
        (group || []).includes(segmentId) &&
        // and it has more than one remaining segments
        group.length > 1
      ) {
        // remove segment Id from the other group
        updatedGroups[idx] = group.filter(id => id !== segmentId);
        // add segment Id to current group, since one segment Id can
        // only exist in one segment group, there won't be duplicates
        updatedGroups[groupId] = groups[groupId].concat(segmentId);
      }
    });
  }

  return updatedGroups;
};

/**
 * determin whether segment filters values are valid
 * @param  {array} filterVals `value` field of each segmentFilter
 * @param  {object} segmentationFeatureMeta feature to segment on, attributes: {name, type, tableFieldIndex, domain}]
 * @return {boolean}
 */
export const isValidFilterVals = (filterVals, segmentationFeatureMeta) => {
  // only support 2 sements
  const [val0, val1] = filterVals;
  if (!val0 || !val1) {
    return false;
  }
  const {type: featureType, domain} = segmentationFeatureMeta;

  if (featureType === FEATURE_TYPE.CATEGORICAL) {
    return (
      // only support one category value per filter
      val0.length === 1 &&
      val1.length === 1 &&
      domain.includes(val0[0]) &&
      domain.includes(val1[0]) &&
      // only support non-overlaping segments
      val0[0] !== val1[0]
    );
  }
  if (featureType === FEATURE_TYPE.NUMERICAL) {
    const min = domain[0];
    const max = domain[domain.length - 1];
    return (
      // each filter value follows [min, max]
      val0.length === 2 &&
      val1.length === 2 &&
      val0[0] <= val0[1] &&
      val1[0] <= val1[1] &&
      // filter values are within the range of `domain`
      min <= val0[0] &&
      min <= val1[0] &&
      max >= val0[1] &&
      max >= val1[1] &&
      // only support non-overlaping segments
      (val0[1] <= val1[0] || val1[1] <= val0[0])
    );
  }
};

/**
 * determin whether segment filters values are valid
 * @param  {[[object]]} segmentFilters - of array of filters, attributes: {name, key, type, value}]
 * @param  {[array]} featureMeta - feature to segment on, attributes: {name, tableFieldIndex, type, domain}]
 * @return {array} - filterVals `value` field of each segmentFilter
 */
export const getFilterValsFromProps = (segmentFilters, featureMeta) => {
  const filterVals = segmentFilters.map(
    segmentFilter => segmentFilter[0].value
  );
  if (isValidFilterVals(filterVals, featureMeta)) {
    return filterVals;
  }
  const {type, domain} = featureMeta;
  if (type === FEATURE_TYPE.CATEGORICAL) {
    return [[], []];
  } else if (type === FEATURE_TYPE.NUMERICAL) {
    const min = domain[0];
    const max = domain[domain.length - 1];
    return [[min, undefined], [undefined, max]];
  }
};

/**
 * determin whether segment filters values are valid
 * @param  {array} filterVals - `value` field of each segmentFilter
 * @param  {[array]} featureMeta - feature to segment on, attributes: {name, type, tableFieldIndex, domain}]
 * @return {[[object]]} - array of array of filters, attributes: {name, key, type, value}]
 */
export const getSegmentFiltersFromValues = (filterVals, featureMeta) => {
  const {name, tableFieldIndex, type} = featureMeta;
  const filterType =
    type === FEATURE_TYPE.CATEGORICAL ? FILTER_TYPE.INCLUDE : FILTER_TYPE.RANGE;
  return filterVals.map(filterVal => [
    {name, key: tableFieldIndex - 1, type: filterType, value: filterVal},
  ]);
};
