import {Array} from 'global';
import {FILTER_TYPE} from '../constants';
import {FEATURE_TYPE, LAT_LNG_PAIRS} from 'packages/mlvis-common/constants';
import assert from 'assert';

export const computeWidthLadder = (widths, margin) => {
  const result = [];
  let lastWidth = 0;
  widths.forEach(w => {
    lastWidth += w + margin;
    result.push(lastWidth);
  });
  return result;
};

export function getDefaultSegmentGroups(nClusters) {
  const nTreatment = nClusters < 4 ? 1 : 2;
  const rangeArr = Array.from(Array(nClusters).keys());
  return [
    rangeArr.slice(nClusters - nTreatment),
    rangeArr.slice(0, nClusters - nTreatment),
  ];
}

export function isValidSegmentGroups(segmentGroups, nSegments) {
  for (let i = 0; i < segmentGroups.length; i++) {
    if (!segmentGroups[i].length) {
      return false;
    }
    // group0 is "otherGroup" for group1; vice versa
    const otherGroup = segmentGroups[(i + 1) % 2];
    for (let j = 0; j < segmentGroups[i].length; j++) {
      const segmentId = segmentGroups[i][j];
      if (
        segmentId < 0 ||
        segmentId >= nSegments ||
        otherGroup.includes(segmentId)
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * filter data items w/ a set of filters
 * @param  {Array<Array<Number|String|Boolean>>>} data an array of data rows
 * @param  {Array<Object>} filters an array of filters w/ attributes: {name, type, key, value}
 * @param  {String} filters.type filter type, one of FILTER_TYPE
 * @param  {Number} filters.key feature.tableFieldIndex of the feature to be filtered on
 * @return {Array<Number>} an array of data ids suffice all the filters
 */
export const filterData = (data, filters) => {
  if (!data || data.length === 0) {
    return null;
  }
  if (!filters || filters.length === 0) {
    return data;
  }
  const filterArray = Array.isArray(filters) ? filters : [filters];
  const idArray = Array.from(Array(data.length).keys());

  return idArray.filter(id => {
    return filterArray.every(({type, key, name, value}) => {
      assert(
        data[id][key] !== undefined,
        `key ${key} ("${name}") doesn't exist in data point ${id}`
      );
      switch (type) {
        case FILTER_TYPE.RANGE:
          return data[id][key] >= value[0] && data[id][key] <= value[1];
        case FILTER_TYPE.INCLUDE:
          return value.includes(data[id][key]);
        case FILTER_TYPE.EXCLUDE:
          return !value.includes(data[id][key]);
        case FILTER_TYPE.FUNC:
          return Boolean(value(data[id][key]));
        default:
          return false;
      }
    });
  });
};

/**
 * compute the order after sorting an array, useful when the order is needed for sorting anothe array
 * @param  {Array} arr - array to sort
 * @param  {Function} sortingFunc - function based on which `arr` is sorted
 * @return {[Number]} item indices in the original `arr` in the order of a sorted array
 */
export function computeSortedOrder(arr, sortingFunc) {
  const orderedArr = arr
    .slice(0)
    .sort((a, b) => sortingFunc(a) - sortingFunc(b));
  return orderedArr.map(item => arr.indexOf(item));
}

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
 * like `combineReducers`, but doesn't enforce each key in `state` is controled by one reducer.
 * If some keys in `state` do not exist in `reducers`, those fields will stay the same in the returned state
 * @param  {Object} reducers - key-value pairs of reducers; e.g. {keplerGl: keplerGlReducer, otherLib: reducerForOtherLib}
 * @return {Function} - a reducer, takes params: `state`, `action`, returns updated state
 * e.g.
 * {
 *    manifoldState1: ...
 *    manifoldState2: ...
 *    keplerGl: ...
 *    otherLib: ...
 * }
 */
export const registerExternalReducers = reducers => {
  const reducerKeys = Object.keys(reducers);

  return function combination(state, action) {
    if (state === undefined) {
      state = {};
    }
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      const previousStateForKey = state[key] || {};
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? {...state, ...nextState} : state;
  };
};

/**
 * merge objects from with the same `joinField`, rename duplicated fields
 * @param {Array<Array<Object>>} arrays
 * @param {String} joinField field to hold consistant among joined objects
 * @param {Array<Object>} rename array of mapping from original key to new key
 * @returns {Array<Object>} joined array of objects
 * @example
 * const arrays = [
 *   [{name: 'alice', score: 99}, {name: 'bob', score: 80}],
 *   [{name: 'alice', score: 'A'}, {name: 'bob', score: 'B'}]
 * ];
 * const rename = [{}, {score: 'gradeScore'}];
 * const zippped = zipObjects(arrays, 'name', rename);
 * // zipped = [{name: 'alice', score: 99, gradeScore: 'A'}, {name: 'bob', score: 80, gradeScore: 'B'}]
 */
export function zipObjects(arrays, joinField, rename) {
  if (!arrays.length) {
    return [];
  }
  return arrays[0].map((sampleObj, i) => {
    const renamedObjs = arrays
      .map(arr => arr[i])
      .map((obj, j) => {
        // make sure joinField is matched for each object in each sub-array
        assert(sampleObj[joinField] === obj[joinField]);
        return Object.keys(obj).reduce((acc, key) => {
          const renamedKey = rename[j][key] || key;
          acc[renamedKey] = obj[key];
          return acc;
        }, {});
      });
    // todo: assert there are no duplicated keys
    return Object.assign.apply(null, renamedObjs);
  });
}

/*
 * Only retain a field in `data` if it first appears in `fields`
 * @example
 * // returns [{'field1': 1, 'field2': 2}]
 * selectFields(['field1', 'field2'], [{'field1': 1, 'field2': 2, 'field3': 3}]);
 * @param: {String[]} fields
 * @param: {Object[]} data
 * @param: {Function} transformer of field name into target object field name
 * @return: {Object[]} a list of data, fields or each item are filtered based on `fields`
 */
export function selectFields(fields, data) {
  return data.map(dataPoint =>
    fields.reduce((acc, field) => {
      acc[field] = dataPoint[field];
      return acc;
    }, {})
  );
}

export function removeSuffixAndDelimiters(layerName, suffix) {
  return layerName
    .replace(new RegExp(suffix, 'ig'), '')
    .replace(/[_,.]+/g, ' ')
    .trim();
}

/**
 * Find point fields pairs from fields
 *
 * @param {Array} fields column fields, contain {name, tableIndex, type, dataType}
 * @returns {Array} fields grouped by lat-lng
 */
export function groupLatLngPairs(fields) {
  const allNames = fields.map(f => f.name.toLowerCase());

  return allNames.reduce((acc, fieldName, idx) => {
    // if not part of a pair, use the field as is
    if (
      LAT_LNG_PAIRS.reduce((acc, arr) => acc.concat(arr), []).every(
        suffix => !fieldName.endsWith(suffix)
      )
    ) {
      acc.push(fields[idx]);
    } else {
      for (const suffixPair of LAT_LNG_PAIRS) {
        // match first suffix```
        if (fieldName.endsWith(suffixPair[0])) {
          // match second suffix
          const otherPattern = new RegExp(`${suffixPair[0]}$`);
          const partner = fieldName.replace(otherPattern, suffixPair[1]);

          const partnerIdx = allNames.findIndex(d => d === partner);
          if (partnerIdx > -1) {
            const featureName = removeSuffixAndDelimiters(
              fieldName,
              suffixPair[0]
            );

            // if it is part of a lat-lng pair, group by common name
            acc.push({
              name: featureName,
              pair: [fields[idx], fields[partnerIdx]],
            });
            return acc;
          }
        }
      }
    }
    return acc;
  }, []);
}
