// @noflow
import {Array} from 'global';
import {FILTER_TYPE} from './constants';
import * as tf from '@tensorflow/tfjs-core';

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
