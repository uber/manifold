import {Array} from 'global';
import {
  FEATURE_TYPE,
  FILTER_TYPE,
  LAT_LNG_PAIRS,
} from '@mlvis/mlvis-common/constants';
import {dotRange} from '@mlvis/mlvis-common/utils';
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

/**
 * get sub dataset by start- and end- column ids
 * @param {Object} data contains {columns, fields}
 * @param {Array<Number>} range array of 2 elements with start (inclusive), end (non-inclusive) index of columns
 */
export const sliceDataset = (data, range) => {
  const {fields, columns} = data;
  const colIds = dotRange(...range);
  return {
    columns: colIds.map(colId => columns[colId]),
    fields: colIds.map(colId => fields[colId]),
  };
};

/**
 * concat an array of datasets
 * @param {Array<Object>} datasets array of datasets, each contains {columns, fields}
 * @returns {Obeject} dataset, contains {columns, fields}
 */
export const concatDataset = datasets => {
  const fieldsArr = datasets.map(d => d.fields);
  let dataLength;
  const columnsArr = datasets.map((d, i) => {
    assert(d.columns[0].length > 0, `dataset[${i}] must by non-empty`);

    dataLength = dataLength || d.columns[0].length;
    assert(
      dataLength === d.columns[0].length,
      `datasets must have the same row count`
    );
    return d.columns;
  });
  return {
    fields: [].concat.apply([], fieldsArr),
    columns: [].concat.apply([], columnsArr),
  };
};

/**
 * get sub dataset by column ids
 * @param {Object} data contains {columns, fields}
 * @param {Array<Number>} indices array of ids indicating which columns to choose from
 */
export const gatherDataset = (data, indices) => {
  const {fields, columns} = data;
  return {
    columns: indices.map(colId => columns[colId]),
    fields: indices.map(colId => fields[colId]),
  };
};

/**
 * aggregate dataset by one categorical feature
 * @param {Object} data contains {columns, fields}
 * @param {Object} groupByFeature one field definition, contains {tableFieldIndex, name, type, dataType}
 * @param {Array<Number>} columnsToInclude ids of columns to include in the output dataset (do not include the `groupByFeature` id)
 * @param {Array<Object>|Object} aggregateFuncs an array of functions indicating the types of metrics to compute out of the aggregation
 * can also be a map of array of functions, mapping from field name to metrics to compute out of that field
 * e.g. [{name: 'mean', func: mean}, {name: 'max', func: Math.max}], or
 * {
 *   feature1: [{name: 'mean', func: mean},
 *   feature2: [{name: 'max', func: Math.max}]
 * }
 * @returns dataset with {columns, fields}
 * @example
 * const data = {
 *   fields: [{name: 'feature1', ...}, {name: 'feature2', ...}, {name: 'feature3', ...}]
 *   columns: [
 *     // values of feature1
 *     [0, 0, 0, 0, 1, 1, 1, 0],
 *     // values of feature2
 *     [0, 1, 2, 3, 4, 5, 6, 7],
 *     // values of feature3
 *     [8, 9, 10, 11, 12, 13, 14, 15],
 *   ]
 * };
 * aggregateDataset(
 *   data,
 *   {name: 'feature1', ...},
 *   [1, 2],
 *   [{name: 'max', func: arr => Math.max(...arr)}]
 * )
 * // returns:
 * {
 *   fields: [{name: 'feature1', ...}, {name: 'feature2_max', ...}, {name: 'feature3_max', ...}]
 *   columns: [
 *     // unique values of feature1
 *     [0, 1],
 *     // max values of feature2 aggregated by values of feature1, i.e. [Math.max(0, 1, 2, 3, 7), Math.max(4, 5, 6)]
 *     [7, 6],
 *     // max values of feature3 aggregated by values of feature1, i.e. [Math.max(8, 9, 10, 11, 15), Math.max(12, 13, 14)]
 *     [15, 14],
 *   ]
 * }
 *
 * aggregateDataset(
 *   data,
 *   {name: 'feature1', ...},
 *   [1, 2],
 *   {
 *     feature2: [{name: 'max', func: arr => Math.max(...arr)}],
 *     feature3: [{name: 'mean', func: mean}],
 *   }
 * )
 * // returns:
 * {
 *   fields: [{name: 'feature1', ...}, {name: 'feature2_max', ...}]
 *   columns: [
 *     // unique values of feature1
 *     [0, 1],
 *     // max values of feature2 aggregated by values of feature1, i.e. [Math.max(0, 1, 2, 3, 7), Math.max(4, 5, 6)]
 *     [7, 6],
 *     // means of feature3 aggregated by values of feature1, i.e. [mena(8, 9, 10, 11, 15), min(12, 13, 14)]
 *     [10.6, 13],
 *   ]
 * }
 */
export const aggregateDataset = (
  data,
  groupByFeature,
  aggregateFuncs,
  columnsToInclude = null
) => {
  const {columns} = data;
  const groupByColumn = columns[groupByFeature.tableFieldIndex - 1];
  // map from category values (e.g. 'SF') to their orders in `catValueArr`
  const catValueMap = {};
  // an array of category values (e.g. ['SF', 'LA', ...])
  const catValueArr = [];
  // an array of array of data ids, ids in the same subarray share the same category value
  const dataIdsByCategory = [];
  assert(
    groupByFeature.type === FEATURE_TYPE.CATEGORICAL ||
      groupByFeature.dataType == 'string',
    'groupByFeature for aggregation must be a non-continuous feature'
  );

  // get an array of array of dataIds grouped by hexId in this column
  // e,g [[0, 4, 5], [2, 8], [3, 6], [1, 7, 9]]
  groupByColumn.forEach((catVal, dataId) => {
    if (catValueMap[catVal] !== undefined) {
      dataIdsByCategory[catValueMap[catVal]].push(dataId);
    } else {
      dataIdsByCategory.push([dataId]);
      catValueMap[catVal] = dataIdsByCategory.length - 1;
      catValueArr.push(catVal);
    }
  });

  // aggregate other columns based on the grouping
  const datasetToAggregate = columnsToInclude
    ? gatherDataset(data, columnsToInclude)
    : data;
  const {columns: columnsToAgg, fields: fieldsToAgg} = datasetToAggregate;

  const getAggregateFuncs = colId => {
    const _aggregateFuncs = Array.isArray(aggregateFuncs)
      ? aggregateFuncs
      : aggregateFuncs[fieldsToAgg[colId].name];
    assert(
      Array.isArray(_aggregateFuncs),
      'aggregateFuncs must be an array of a map of arrays'
    );
    return _aggregateFuncs;
  };
  const resultColumns = columnsToAgg.reduce((acc, col, colId) => {
    const _aggregateFuncs = getAggregateFuncs(colId);
    const metricColsFromOneCol = _aggregateFuncs.map(metric => {
      const {func, name} = metric;
      assert(
        typeof func === 'function' &&
          (typeof name === 'function' || typeof name === 'string'),
        'aggregateFuncs must have `func` and `name` fields'
      );
      return dataIdsByCategory.map(dataIds => {
        const subCol = dataIds.map(dataId => col[dataId]);
        return func(subCol);
      });
    });
    return acc.concat(metricColsFromOneCol);
  }, []);

  // tableFieldIndex starts from 2; 1 is saved for `groupByFeature` column
  let fieldsLength = 1;
  const resultFields = fieldsToAgg.reduce((acc, field, i) => {
    const _aggregateFuncs = getAggregateFuncs(i);
    const metricFieldsFromOneField = _aggregateFuncs.map((metric, j) => {
      fieldsLength++;
      return {
        name:
          typeof metric.name === 'function'
            ? metric.name(field.name)
            : `${field.name}_${metric.name}`,
        tableFieldIndex: fieldsLength,
        // todo: in some cases data can be other types
        dataType: 'float',
      };
    });
    return acc.concat(metricFieldsFromOneField);
  }, []);

  // add groupby feature as a column
  resultColumns.unshift(catValueArr);
  resultFields.unshift({
    ...groupByFeature,
    tableFieldIndex: 1,
  });

  return {
    columns: resultColumns,
    fields: resultFields,
  };
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
 * @param  {Object} data {columns, fields}
 * @param  {Array<Array<Number|String|Boolean>>>} data.columns an array of data rows
 * @param  {Array<Object>} data.fields an array of field definitions w/ attributes: {name, type, tableFieldIndex}
 * @param  {Array<Object>} filters an array of filters w/ attributes: {name, type, key, value}
 * @param  {String} filters.type filter type, one of FILTER_TYPE
 * @param  {Number} filters.key feature.tableFieldIndex of the feature to be filtered on
 * @return {Array<Number>} an array of data ids suffice all the filters
 */
export const filterDataset = (data, filters) => {
  const {columns} = data;
  if (!columns || columns.length === 0) {
    return null;
  }
  const idArray = dotRange(columns[0].length);
  if (!filters || filters.length === 0) {
    return idArray;
  }
  const filterArray = Array.isArray(filters) ? filters : [filters];

  return idArray.filter(id => {
    return filterArray.every(({type, key, value}) => {
      const columnToFilter = columns[key];
      switch (type) {
        case FILTER_TYPE.RANGE:
          return (
            columnToFilter[id] >= value[0] && columnToFilter[id] <= value[1]
          );
        case FILTER_TYPE.INCLUDE:
          return value.includes(columnToFilter[id]);
        case FILTER_TYPE.EXCLUDE:
          return !value.includes(columnToFilter[id]);
        case FILTER_TYPE.FUNC:
          return Boolean(value(columnToFilter[id]));
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
