// @noflow
import {Array} from 'global';
import {FILTER_TYPE} from './constants';
import * as tf from '@tensorflow/tfjs-core';
import {FEATURE_TYPE} from 'packages/mlvis-common/constants';

/**
 * @param {Object} userData - {x: <file>, yPred: [<file>], yTrue: file}
 */
export function isDatasetIncomplete(userData) {
  const {x, yPred, yTrue} = userData;
  if (!x || !yPred || !yTrue || !yPred.length) {
    return true;
  }
  return false;
}

export function validateInputData(data) {
  const inputKeys = ['x', 'yTrue', 'yPred'];
  if (
    typeof data !== 'object' ||
    inputKeys.some(key => Object.keys(data).indexOf(key) < 0)
  ) {
    throw new Error(
      'Input data must contain these keys: `x`, `yTrue`, `yPred`.'
    );
  }
  const {x, yTrue, yPred} = data;
  if (!x || !yTrue || !yPred || !x.length || !yTrue.length || !yPred.length) {
    throw new Error(
      'One or more required fields (`x`, `yTrue`, `yPred`) in input data is empty.'
    );
  }
  const nInstances = x.length;
  if (yTrue.length !== nInstances || yPred.some(y => y.length !== nInstances)) {
    throw new Error(
      'Number of data instances in `x`, `yTrue` and `yPred` are not consistant. ' +
        'Check the shape of your input data.'
    );
  }
  const predInstance0 = yPred[0][0];
  if (typeof predInstance0 !== 'object') {
    throw new Error(
      '`yPred` must be an array of array of objects. ' +
        'Check the shape of your input data.'
    );
  }
  const predObjKeys = Object.keys(predInstance0);

  yPred.forEach((predArr, i) => {
    predArr.forEach((predEle, j) => {
      if (Object.keys(predEle).some(key => predObjKeys.indexOf(key) < 0)) {
        throw new Error(
          `yPred[${i}][${j}] has a different shape than other element in yPred.
          Check your input data.`
        );
      }
    });
  });

  yTrue.forEach((trueEle, i) => {
    // regression
    if (predObjKeys.length === 1) {
      if (typeof yTrue[i] !== 'number') {
        throw new Error(
          `yTrue[${i}] has wrong data type. Check your input data.`
        );
      }
    }
    // classification
    else {
      if (predObjKeys.indexOf(trueEle) < 0) {
        throw new Error(
          `Class label at yTrue[${i}] is not found in corresbonding yPred.
            Check your input data.`
        );
      }
    }
  });
  return data;
}

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
 * @param {Array} targets - 1-D array of targets
 * @param {Array} predictions - 2-D array of predictions
 * @param {Array} labels - array of class labels
 * @param {Number} eps - small number to prevent Infinity
 * @return 1-D array of errors
 */
export const logLoss = (
  targets = [],
  predictions = [],
  labels = [],
  eps = 1e-15
) => {
  if (!targets.length || !predictions.length || !labels.length) {
    return;
  }
  return tf.tidy(() => {
    const targetOneHot = tf.oneHot(
      tf.tensor1d(
        targets.map(target => labels.indexOf(String(target))),
        'int32'
      ),
      labels.length
    );
    return tf
      .sub(
        tf.scalar(0),
        tf.sum(
          tf.mul(
            tf.cast(targetOneHot, 'float32'),
            tf.log(tf.clipByValue(tf.tensor2d(predictions), eps, 1 - eps))
          ),
          1
        )
      )
      .dataSync();
  });
};

/**
 * @param {Array} targets - 1-D array of targets
 * @param {Array} predictions - 2-D array of predictions (second dimension size is 1)
 * @return 1-D array of errors
 */
export const absoluteError = (targets = [], predictions = []) => {
  if (!targets.length || !predictions.length) {
    return;
  }
  return tf.tidy(() =>
    tf
      .abs(tf.sub(tf.tensor1d(targets), tf.squeeze(tf.tensor2d(predictions))))
      .dataSync()
  );
};

/**
 * @param {Array} targets - 1-D array of targets
 * @param {Array} predictions - 2-D array of predictions (second dimension size is 1)
 * @return 1-D array of errors
 */
export const squaredLogError = (targets = [], predictions = []) => {
  if (!targets.length || !predictions.length) {
    return;
  }
  return tf.tidy(() =>
    tf
      .square(
        tf.sub(
          tf.log1p(tf.tensor1d(targets)),
          tf.log1p(tf.squeeze(tf.tensor2d(predictions)))
        )
      )
      .dataSync()
  );
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
 * @param  {[object]} data    [an array of data items]
 * @param  {[object]} filters [an array of filters w/ attributes: {type, key, value}]
 * @return {[Number]}         [an array of data ids suffice all the filters]
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
    return filterArray.every(({type, key, value}) => {
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
 * @param  {object} segmentationFeatureMeta feature to segment on, attributes: {name, type, domain}]
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
 * @param  {[array]} featureMeta - feature to segment on, attributes: {name, type, domain}]
 * @return {[[object]]} - array of array of filters, attributes: {key, type, value}]
 */
export const getSegmentFiltersFromValues = (filterVals, featureMeta) => {
  const {name, type} = featureMeta;
  const filterType =
    type === FEATURE_TYPE.CATEGORICAL ? FILTER_TYPE.INCLUDE : FILTER_TYPE.RANGE;
  return filterVals.map(filterVal => [
    {key: name, type: filterType, value: filterVal},
  ]);
};

/**
 * determin whether segment filters values are valid
 * @param  {[[object]]} segmentFilters - of array of filters, attributes: {key, type, value}]
 * @param  {[array]} featureMeta - feature to segment on, attributes: {name, type, domain}]
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
