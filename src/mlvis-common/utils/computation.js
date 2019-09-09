import assert from 'assert';
import * as tf from '@tensorflow/tfjs-core';
import {kldivergence, quantileSeq} from 'mathjs';
import {
  NULL_VALS,
  DATA_TYPE,
  FEATURE_TYPE,
  LAT_LNG_PAIRS,
  HEX_INDICATORS,
  UUID_NAME,
} from '../constants';

// dotRange(3) ==> [0, 1, 2];
// dotRange(1, 3) ==> [1, 2];
// todo: use lodash
export const dotRange = (...args) => {
  if (args.length < 1) {
    return null;
  } else if (args.length === 1) {
    args.unshift(0);
  }
  const result = [];
  for (let i = args[0]; i < args[1]; i++) {
    result.push(i);
  }
  return result;
};

/**
 * compute mean of an array
 * @param {Array<Number>} data
 */
export const mean = data => {
  assert(
    Array.isArray(data) && data.length > 0,
    '`data` must be a non-empty array'
  );
  return data.reduce((acc, d) => acc + d, 0) / data.length;
};

export const computePercentiles = (data, percentiles) => {
  return quantileSeq(data, percentiles);
};

/**
 * transpose an array of arrays of data
 * @param {Array<Array>} dataArray array of arrays of data
 * @returns array of arrays of data, elements at dataArray[i][j] will be at result[j][i]
 */
export const transposeData = dataArray => {
  assert(
    dataArray.length && dataArray[0].length,
    'cannot transpose an array with dimension 0'
  );
  // instantiate an array of dataArray[0].length number of subarrays
  const result = dotRange(dataArray[0].length).map(_ => []);
  dataArray.forEach(arr => {
    arr.forEach((ele, j) => {
      result[j].push(ele);
    });
  });
  return result;
};

const UNIQ_COUNT_THRESHOLD = 8;
const UNIQ_PERCENTAGE_THRESHOLD = 0.1;
const INVALID_COUNT_THRESHOLD = 100;
const INVALID_PERCENTAGE_THRESHOLD = 0.5;
const FEATURE_HISTOGRAM_RESOLUTION = 100;

/**
 * compute basic information of models
 * @param {[Array]} yPred - An array of arrays, predicted values for each class from each models.
 * @return {Number} nModels
 * @return {Number} nClasses
 * @return {Array} classLabels - array of strings representing class names
 */
export const computeModelsMeta = yPred => {
  const predInstance0 = yPred[0][0];
  const classLabels = Object.keys(predInstance0);
  const nClasses = classLabels.length > 1 ? classLabels.length : 1;
  return {
    nModels: yPred.length,
    nClasses,
    classLabels,
  };
};

/**
 * compute basic information of features
 * @param {Array<Object>} x - An array of objects, csv raw feature data.
 * @return {Array<Object>} feature fields (only valid features are kept). Each object has keys `name` `type` `dataType` `domain`
 */
export const computeFeaturesMeta = (
  x,
  resolution = FEATURE_HISTOGRAM_RESOLUTION
) => {
  return Object.keys(x[0])
    .map(featureName => {
      const values = x.map(d => d[featureName]);
      return computeFeatureMeta(featureName, values, resolution);
    })
    .filter(
      // ignore features with too may categories, like uuid; ignore features with only one category
      feature => feature.type !== null
    );
};

/**
 * @param {Array} data feature values
 * @param {Array} uniqueDataVals unique values in feature values
 * @return {Boolean}
 * */
export const isFeatureInvalid = (
  data,
  uniqueDataVals = null,
  invalidCountThreshold = INVALID_COUNT_THRESHOLD,
  invalidPercentageThreshold = INVALID_PERCENTAGE_THRESHOLD
) => {
  const uniques = uniqueDataVals || Array.from(new Set(data));
  const hasNaN = uniques.some(d => isNaN(d) || d === null);
  return (
    uniques.length < 2 ||
    (hasNaN &&
      uniques.length > data.length * invalidPercentageThreshold &&
      uniques.length > invalidCountThreshold)
  );
};

/**
 * get data type of feature values
 * @param {Array} data feature values
 * @returns {String} one of kepler data types https://github.com/keplergl/kepler.gl/blob/master/src/constants/default-settings.js#L259
 */
export const computeDataType = data => {
  for (var i = 0; i < data.length; i += 1) {
    if (!NULL_VALS.includes(data[i])) {
      break;
    }
  }
  if (i >= data.length) {
    return DATA_TYPE.NULL;
  }
  switch (typeof data[i]) {
    case 'number':
      if (Number.isInteger(data[i])) {
        return DATA_TYPE.INTEGER;
      } else {
        return DATA_TYPE.REAL;
      }
    case 'boolean':
      return DATA_TYPE.BOOLEAN;
    case 'string':
      return DATA_TYPE.STRING;
    default:
      return DATA_TYPE.NULL;
  }
};

/**
 * @param {String} name feature name
 * @param {Array} data feature values
 * @param {Array} uniqueDataVals unique values in feature values
 * @return {String} one of FEATURE_TYPEs
 * */
export const computeFeatureType = (
  name,
  data,
  uniqueDataVals = null,
  uniqCountThreshold = UNIQ_COUNT_THRESHOLD,
  uniqPercentageThreshold = UNIQ_PERCENTAGE_THRESHOLD
) => {
  // analyze type from data
  const uniques = uniqueDataVals || Array.from(new Set(data));
  const hasNaN = uniques.some(d => isNaN(d) || d === null);

  const isCategorical =
    (uniques.length < uniqCountThreshold &&
      uniques.length < data.length * uniqPercentageThreshold) ||
    hasNaN;

  // analyze type from name
  const isLatLngByName = LAT_LNG_PAIRS.reduce(
    (acc, arr) => acc.concat(arr),
    []
  ).some(suffix => name.endsWith(suffix));
  const isHexByName = HEX_INDICATORS.some(hexIndicator =>
    name.includes(hexIndicator)
  );
  return isLatLngByName || isHexByName
    ? FEATURE_TYPE.GEO
    : isCategorical
    ? FEATURE_TYPE.CATEGORICAL
    : FEATURE_TYPE.NUMERICAL;
};

/**
 * identify whether a feature is categorical from its unique values
 * @param {String} name feature name
 * @param {Array} data feature values
 * @param {Number} resolution granularity of bins for numerical feature domain
 * @return {Object} type and domain of the feature
 * */
export const computeFeatureMeta = (name, data, resolution) => {
  const uniques = Array.from(new Set(data));
  const dataType = computeDataType(uniques);
  if (uniques.length == data.length && name === UUID_NAME) {
    return {
      name,
      type: FEATURE_TYPE.UUID,
      dataType,
      domain: null,
    };
  }
  const isInvalid = isFeatureInvalid(data, uniques);
  if (isInvalid) {
    return {
      name,
      type: null,
      dataType,
      domain: null,
    };
  }
  const type = computeFeatureType(name, data, uniques);
  let domain;
  switch (type) {
    case FEATURE_TYPE.NUMERICAL:
      domain = computeNumericFeatureDomain(uniques, resolution);
      break;
    case FEATURE_TYPE.CATEGORICAL:
      domain = uniques;
      break;
    default:
      domain = [];
  }
  return {
    name,
    type,
    dataType,
    domain,
  };
};

export const computeNumericFeatureDomain = (
  values,
  resolution = FEATURE_HISTOGRAM_RESOLUTION
) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = (max - min) / resolution;
  return dotRange(resolution + 1).map(d => min + d * step);
};

/**
 * @param {Array} data - 1-D array of data points
 * @param {Array} bins - (optional) categories
 * @returns [{Array}] an array of 2 arrays:
 * 0: hist, values of the histogram; 1: categories, length = hist.length.
 */
export function computeHistogramCat(data, bins) {
  // parse the overloaded bins argument
  let categories;

  if (bins === undefined) {
    categories = Array.from(new Set(data));
  } else if (Array.isArray(bins) && bins.length) {
    categories = bins;
  } else {
    throw '`bins` must be an non-empty array';
  }

  const nBins = categories.length;
  const indices = tf.tensor1d(data.map(d => categories.indexOf(d))).toInt();
  const binIds = tf.linspace(0, nBins - 1, nBins).toInt();

  const hist = binCount(indices, binIds);
  return [Array.from(hist.dataSync()), categories];
}

/**
 * @param {Array} data - 1-D array of data points
 * @param {Number|Array} bins - number of bins, or bin edges
 * @return [{Array}] an array of 2 arrays:
 * 0: hist, values of the histogram;
 * 1: binEdges, an array of edge values (X values) of bins, length = hist.length + 1.
 */
export function computeHistogram(data, bins) {
  return tf.tidy(() => {
    const dt = tf.tensor(data);
    if (dt.dtype === 'string') {
      return computeHistogramCat(data, bins);
    }
    const minVal = tf.min(dt).dataSync()[0];
    const maxVal = tf.max(dt).dataSync()[0];

    // parse the overloaded bins argument
    let nBins, binEdges, firstEdge, lastEdge;

    if (Number.isInteger(bins)) {
      nBins = bins;
      binEdges = tf.linspace(minVal, maxVal, nBins + 1);
      firstEdge = minVal;
      lastEdge = maxVal;
    } else if (bins.length) {
      nBins = bins.length - 1;
      binEdges = tf.tensor1d(bins);
      firstEdge = bins[0];
      lastEdge = bins[bins.length - 1];
    } else {
      throw '`bins` must be a number or an array';
    }

    // histogram scaling factor
    const norm = nBins / (lastEdge - firstEdge);

    const indicesRaw = tf
      .mul(tf.sub(dt, tf.scalar(firstEdge)), tf.scalar(norm))
      .toInt();

    // for values that lie exactly on lastEdge we need to subtract one
    const indices = tf.sub(
      indicesRaw,
      tf.equal(indicesRaw, tf.scalar(nBins).toInt()).toInt()
    );

    const binIds = tf.linspace(0, nBins - 1, nBins).toInt();
    const hist = binCount(indices, binIds);

    return [Array.from(hist.dataSync()), Array.from(binEdges.dataSync())];
  });
}

/**
 * @param {Array} data - 1-D array of data points
 * @param {Number|Array} bins - number of bins, or bin edges
 * @return {Array<Array>} an array of 2 arrays:
 * 0: density, histogram where each element is divided by the range of domain;
 * 1: binEdges, an array of edge values (X values) of bins, length = hist.length + 1.
 */
export function computeDensity(data, bins) {
  const [hist, binEdges] = computeHistogram(data, bins);
  // prevent dividing by 0
  const yScalingFactor =
    binEdges.length < 2 ? 1 : 1 / (binEdges[binEdges.length - 1] - binEdges[0]);
  return [hist.map(h => h * yScalingFactor), binEdges];
}

/**
 * @param {Array} data - 1-D array, each element is a bin id
 * @param {Number} bins - 1-D array representing bin indices
 * @return {Tensor1D} number of occurrences of bin indices, ordered by bin index
 */
export function binCount(data, bins) {
  return tf.tidy(() => {
    return tf.sum(
      tf.equal(
        // perform outer operations by expanding dimensions
        tf.expandDims(data, 1),
        bins
      ),
      0
    );
  });
}

/**
 * @param {String} type - data type
 * @param {[Number|String]} domain - an array representing the domain of the distribution
 * @param {[Array]} values - an array of 2 arrays, each containing feature values of the 2 segment groups
 * @return {[Array]} an array of 2 arrays, each containing histogram values of the 2 segment groups
 */
export function computeSegmentedFeatureDistributions(type, domain, values) {
  if (![FEATURE_TYPE.CATEGORICAL, FEATURE_TYPE.NUMERICAL].includes(type)) {
    throw new Error('unknown or invalid feature type: ', type);
  }
  const histogramFunc =
    type === FEATURE_TYPE.CATEGORICAL ? computeHistogramCat : computeHistogram;
  // use same bins for every segmented distributions
  // use `[0]` to get only histogram values and not domains
  const T = histogramFunc(values[0], domain)[0];
  const C = histogramFunc(values[1], domain)[0];
  return [T, C];
}

/**
 * @param {[Array]} distributions - an array of 2 arrays,
 * each containing unnormalized distributions of the 2 segment groups
 * @return {[Array]} an array of 2 arrays,
 * each containing normalized distributions of the 2 segment groups
 */
export function computeSegmentedFeatureDistributionsNormalized(distributions) {
  const [T, C] = distributions;
  const sumT = T.reduce((acc, val) => acc + val, 0);
  const sumC = C.reduce((acc, val) => acc + val, 0);

  // equalize both count distribution to [0, 1]
  const equalizedT = T.map(val => val / sumT);
  const equalizedC = C.map(val => val / sumC);

  const all = equalizedT.concat(equalizedC);
  const min = Math.min(...all) - 1e-9;
  const max = Math.max(...all);
  const range = max - min;

  const normT = equalizedT.map(val => (val - min) / range);
  const normC = equalizedC.map(val => (val - min) / range);

  return [normT, normC];
}

/**
 * @param {[Array]} distributions - an array of 2 arrays, 2 normalized distributions
 * @return {Number}
 */
export function computeDivergence(distributions) {
  if (distributions[0].length === distributions[1].length) {
    return kldivergence(distributions[0], distributions[1]);
  }
  return Number.MAX_SAFE_INTEGER;
}

/**
 * @param {Array} targets - 1-D array of targets
 * @param {Array} predictions - 2-D array of predictions. shape = [numClasses, numInstances]
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
            tf.log(
              tf.clipByValue(
                tf.transpose(tf.tensor2d(predictions)),
                eps,
                1 - eps
              )
            )
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
