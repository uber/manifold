import {Array} from 'global';
import setWith from 'lodash.setwith';
import clone from 'lodash.clone';
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

// adapted from lodash.product https://github.com/SeregPie/lodash.product
/**
 * get the cartesian product from a few arrays
 * @param {Array<Array<Any>>} collectionArr
 * @return {Array<Array<Any>>}
 * @example
 * product([[false, true], ['a', 'b', 'c'], [{}]]);
 * // returns [[false, 'a', {}], [false, 'b', {}], [false, 'c', {}], [true, 'a', {}], [true, 'b', {}], [true, 'c', {}]]
 */
export function product(collectionArr) {
  let result = [];
  function recur(collection) {
    if (collection.length < collectionArr.length) {
      collectionArr[collection.length].forEach(value => {
        recur(collection.concat(value));
      });
    } else {
      result.push(collection);
    }
  }
  recur([]);
  return result;
}

/**
 * Immutable set function for plain JS Object. Makes a shallow clone of all objects affected in the path
 * @param {Object|Array} obj - object to assign in
 * @param {String|Array<String>} path - path to set th value i
 * @param {Any} value - value to assign with
 * @return {Object|Array}
 */
export function dotSet(obj, path, value) {
  return setWith(clone(obj), path, value, clone);
}

// todo: to be consolidated with `computeNumericalFeatureDomain`
export function getColumnMinMax(values) {
  let min = Infinity;
  let max = -Infinity;
  values.forEach(val => {
    if (val < min) min = val;
    if (val > max) max = val;
  });
  return [min, max];
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

/**
 * function to set `state[field]` to a default value if and only if current state[field] value id invalid
 * @param {Objetct} state - redux state
 * @param {String} field - field name in `state`
 * @param {Function} validateFunc - function to decide whether `state[field]` is invalid. Input: state; output: boolean
 * @param {Function} setDefaultFunc - function to return a default value for `state[field]`. Input: state; output: field value
 * @return updated redux state
 *
 * @example
 * const state1 = {a: {c: 5}, b: 6};
 * const state2 = {a: {c: 5}, b: 11};
 * const field = 'b';
 * const validateFunc = state => state.b >= state.a.c * 2;
 * const setDefaultFunc = state => 2 * state.a.c;
 * validateAndSetDefaultStateSingle(state1, field, validateFunc, setDefaultFunc)
 * // returns {a: {c: 5}, b: 10}
 * validateAndSetDefaultStateSingle(state2, field, validateFunc, setDefaultFunc)
 * // returns {a: {c: 5}, b: 11}
 */
export function validateAndSetDefaultStateSingle(
  state,
  field,
  validateFunc,
  setDefaultFunc
) {
  // if `state.field` is valid, don't modify state
  if (validateFunc(state)) {
    return state;
  }
  const defaultField = setDefaultFunc(state);
  if (process.ENV !== 'production') {
    console.warn(`${field} is not valid, resetting to ${defaultField}`);
  }
  // otherwise, create new state
  return {
    ...state,
    [field]: defaultField,
  };
}

/**
 * Used for configuring 1) validation criteria for each field in state;
 * 2) default value fro each state if they are invalid; 3) dependency chain among fields
 * @param {Array<String>} fieldChain - an array of field names in `state`.
 * Order if the fields dignify the dependency relationship between fields:
 * default values of fields with a larger index might depend on (zero or more) fields with a smaller index
 * fields with a larger index never depend on fields with smaller indices
 * @param {Map<String:Function>} validateFuncs - a mapping from each of the field names to functions to check whether those fields are valid
 * @param {Map<String:Function>} setDefaultFuncs - a mapping from each of the field names to functions that returns default value of that field
 * @return {Function} a function to validate each of the fields in state on-by-one, and set them to default if they are invalid. Input: state; output: updated state
 *
 * @example
 * const state = {a: 2, b: 2, c: 2};
 * const validateFuncs = {
 *   b: state => state.b > state.a,
 *   c: state => state.c > state.b,
 * };
 * const setDefaultFuncs = {
 *   b: state => state.a + 1,
 *   c: state => state.b + 2,
 * };
 * const validateAndSetDefault = validateAndSetDefaultStatesConfigurator(['b', 'c'], validateFuncs, setDefaultFuncs);
 * const validateAndSetDefaultReversed = validateAndSetDefaultStatesConfigurator(['c', 'b'], validateFuncs, setDefaultFuncs);
 * validateAndSetDefault(state);
 * // returns {a: 2, b: 3, c: 5}
 * validateAndSetDefaultReversed(state);
 * // returns {a: 2, b: 3, c: 4}
 */
export function validateAndSetDefaultStatesConfigurator(
  fieldChain,
  validateFuncs,
  setDefaultFuncs
) {
  return state => {
    return fieldChain.reduce((acc, field) => {
      const validateFunc = validateFuncs[field];
      const setDefaultFunc = setDefaultFuncs[field];
      assert(
        typeof validateFunc === 'function' &&
          typeof setDefaultFunc === 'function',
        `both validateFuncs[${field}] and setDefaultFuncs[${field}] need to be functions`
      );
      return validateAndSetDefaultStateSingle(
        acc,
        field,
        validateFunc,
        setDefaultFunc
      );
    }, state);
  };
}
