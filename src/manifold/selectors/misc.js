// @noflow
import {createSelector} from 'reselect';
import {kldivergence} from 'mathjs';

import {
  computeHistogram,
  computeHistogramCat,
  computeFeatureMeta,
} from '@uber/mlvis-common/utils';

import {
  rootSelector,
  getMetric,
  getNClusters,
  getSegmentFilters,
  getSegmentGroups,
  getBaseModels,
} from './base';
import {
  computePercentiles,
  computeClusters,
  logLoss,
  absoluteError,
  filterData,
} from '../utils';

import {
  FEATURE_TYPE,
  METRIC,
  PRED_PREFIX,
  PERF_PREFIX,
  ACTUAL_PREFIX,
  CLASS_LABELS,
  PRED_COL_IN,
  TARGET_COL_IN,
} from '../constants';
import {Array} from 'global';

const MODEL_PERF_HISTOGRAM_RESOLUTION = 50;
const FEATURE_VALUE_HISTOGRAM_RESOLUTION = 50;
const PERCENTILE_LIST = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

// ---------------------------------------------------------------------------- //
// ---- THE MISC SELECTORS DO ALL THE DATA TRANSFORMATION IN THE FRONT-END ---- //
// ---------------------------------------------------------------------------- //

// -- raw csv data -- //
const getRawPredData = createSelector(
  rootSelector,
  state => state.rawPredData
);
const getRawFeatureData = createSelector(
  rootSelector,
  state => state.rawFeatureData
);

// ------------------------------------------------------------------------- //
// -------------------------------- META DATA ------------------------------ //
// ------------------------------------------------------------------------- //

/**
 * compute basic information of models
 * @param {Array} predDataArr - An array of csv raw prediction data.
 * @return {Number} nModels
 * @return {Number} nClasses
 * @return {Array} classLabels - array of strings representing class names
 */
export const getModelsMeta = createSelector(
  getRawPredData,
  predDataArr => {
    if (!predDataArr || !predDataArr.length || !predDataArr[0].length) {
      return;
    }
    const predDataPoint = predDataArr[0][0];
    const classLabels = CLASS_LABELS(Object.keys(predDataPoint));
    const nClasses = classLabels.length !== 0 ? classLabels.length : 1;
    return {
      nModels: predDataArr.length,
      nClasses,
      classLabels: classLabels.length !== 0 ? classLabels : undefined,
    };
  }
);

const getFeatureDistributionResolution = () =>
  FEATURE_VALUE_HISTOGRAM_RESOLUTION;

/**
 * compute basic information of features
 * @param {Array} featureData - An array of csv raw feature data.
 * @return {Number} nModels
 * @return {Number} nClasses
 * @return {Array} classLabels - array of strings representing class names
 */
export const getFeaturesMeta = createSelector(
  getRawFeatureData,
  getFeatureDistributionResolution,
  (featureData, resolution) => {
    if (!featureData || !featureData.length) {
      return [];
    }
    return (
      Object.keys(featureData[0])
        .map(featureName => {
          const values = featureData.map(d => d[featureName]);
          // todo: optimize uniques computation
          const {type, domain: categories} = computeFeatureMeta(values);
          const bins =
            type === FEATURE_TYPE.CATEGORICAL ? categories : resolution;

          // exit early if feature type is invalid
          if (type === null) {
            return {
              type,
            };
          }
          const histogramFunc =
            type === FEATURE_TYPE.CATEGORICAL
              ? computeHistogramCat
              : computeHistogram;
          const [histogram, domain] = histogramFunc(values, bins);

          return {
            name: featureName,
            domain,
            histogram,
            type,
          };
        })
        // ignore features with too may categories, like uuid; ignore features with only one category
        .filter(feature => feature.type !== null)
    );
  }
);

export const getMetaDataFromRaw = createSelector(
  [getModelsMeta, getFeaturesMeta],
  (modelsMeta, featuresMeta) => {
    return {
      modelsMeta,
      featuresMeta,
    };
  }
);

// ------------------------------------------------------------------------- //
// ---------------------- PERFORMANCE COMPARISON VIEW ------------------------ //
// ------------------------------------------------------------------------- //

// merge predictions and performances of different models into one list.
// in each element, "model_" are performances, "modelClass_" are raw predictions
export const getDataPerformance = createSelector(
  [getRawPredData, getModelsMeta],
  (predDataArr, modelsMeta) => {
    if (!predDataArr.length || !predDataArr[0].length || !modelsMeta) {
      return [];
    }
    const {nClasses = 2, classLabels = []} = modelsMeta;

    // regression vs classification
    const perfFunc = nClasses === 1 ? absoluteError : logLoss;

    // prediction column(s) name(s) in input data
    const predColsForClasses =
      classLabels.length === 0
        ? [PRED_COL_IN]
        : classLabels.map(classLabel => PRED_PREFIX + classLabel);

    // performance arrays by model
    const perfCols = predDataArr.map(singleModelPredArr => {
      const predictArr = singleModelPredArr.map(instance =>
        predColsForClasses.map(classCol => instance[classCol])
      );
      const target = singleModelPredArr.map(instance =>
        isNaN(instance[TARGET_COL_IN])
          ? String(instance[TARGET_COL_IN]).toLowerCase()
          : instance[TARGET_COL_IN]
      );
      return perfFunc(target, predictArr, classLabels);
    });

    return predDataArr[0].map((_, dataId) => {
      return predDataArr.reduce((acc, singleModelPredArr, modelId) => {
        predColsForClasses.forEach((classCol, classId) => {
          acc[ACTUAL_PREFIX + modelId + '_' + classId] =
            singleModelPredArr[dataId][classCol];
        });
        acc[PERF_PREFIX + modelId] = perfCols[modelId][dataId];

        return acc;
      }, {});
      // 17924.6ms --> 112.77ms
    });
  }
);

export const getClusteringInput = createSelector(
  [getDataPerformance, getModelsMeta, getBaseModels, getMetric],
  (perfArr = [], modelsMeta = {}, baseModels = [], metric) => {
    if (!perfArr.length) {
      return [];
    }
    const {nClasses} = modelsMeta;
    const baseModelMetricCols = Object.keys(perfArr[0])
      // choose relevant models
      .filter(name =>
        baseModels.length ? baseModels.includes(name.split('_')[1]) : true
      )
      // choose performance cols or actual prediction cols
      .filter(name =>
        metric === METRIC.PERFORMANCE
          ? name.startsWith(PERF_PREFIX)
          : name.startsWith(ACTUAL_PREFIX)
      )
      // remove predictions of class 0 if using actual
      .filter(name =>
        nClasses > 1 && metric === METRIC.ACTUAL
          ? name.split('_')[2] !== '0'
          : true
      );
    return perfArr.map(perfItem =>
      baseModelMetricCols.map(model => perfItem[model])
    );
  }
);

export const getDataIdsInSegments = createSelector(
  [getClusteringInput, getRawFeatureData, getNClusters, getSegmentFilters],
  (clusteringInput = [], rawFeatures, nClusters = 4, segmentFilters = []) => {
    if (segmentFilters && segmentFilters.length) {
      // todo: merge rawPred, rawFeatures, and clusteringInput for manual filters
      return segmentFilters.map(filter => filterData(rawFeatures, filter));
    }
    if (!clusteringInput.length || !clusteringInput[0].length) {
      return;
    }
    const clusterIds = computeClusters(clusteringInput, nClusters);
    const result = [];
    for (let i = 0; i < nClusters; i++) {
      result.push([]);
    }
    for (let i = 0; i < clusterIds.length; i++) {
      result[clusterIds[i]].push(i);
    }
    return result;
  }
);

export const getModelPerfHistograms = createSelector(
  [getDataPerformance, getDataIdsInSegments, getModelsMeta, getMetric],
  (
    perfArr = [],
    segmentedIds = [],
    modelsMeta = {},
    metric = METRIC.PERFORMANCE
  ) => {
    if (!perfArr.length || !segmentedIds.length) {
      return null;
    }
    const {nModels} = modelsMeta;
    // todo: consider cases with more than one class
    const modelKeyArr =
      metric === METRIC.PERFORMANCE
        ? Array.from(Array(nModels).keys()).map(m => PERF_PREFIX + m)
        : Array.from(Array(nModels).keys()).map(m => ACTUAL_PREFIX + m + '_0');

    // sort by the median performance of the first model.
    // "percentiles" includes [.01, .1, .25, .5, .75, .9, .99] percentiles of model performance
    const fieldToSortBy = cluster =>
      cluster.modelsPerformance[0].percentiles[3];

    const result = segmentedIds
      .map((segment, segmentId) => {
        // histograms of performance grouped by model, grouped by segment
        const perfHistogram = modelKeyArr.map(modelId => {
          const segmentedPerfArr = segment.map(
            dataId => perfArr[dataId][modelId]
          );

          const [histo, xVals] = computeHistogram(
            segmentedPerfArr,
            MODEL_PERF_HISTOGRAM_RESOLUTION
          );
          const domain = xVals.slice(0, histo.length);

          return {
            modelId,
            // todo: assign model name
            modelName: modelId,
            density: [domain, histo],
            percentiles: computePercentiles(segmentedPerfArr, PERCENTILE_LIST),
          };
        });
        return {
          numDataPoints: segment.length,
          dataIds: segment,
          modelsPerformance: perfHistogram,
        };
      })
      .sort((a, b) => fieldToSortBy(a) - fieldToSortBy(b));
    // reassign segment ids after sorting
    result.forEach((segment, segmentId) => {
      segment.segmentId = 'segment_' + segmentId;
    });
    return result;
  }
);

// ------------------------------------------------------------------------- //
// ---------------------- FEATURE DISTRIBUTION VIEW ------------------------ //
// ------------------------------------------------------------------------- //

// combine segmented data ids into treatment and control groups
export const getDataIdsInSegmentGroups = createSelector(
  [getDataIdsInSegments, getSegmentGroups],
  (dataIdsInSegments, segmentGroups) => {
    if (!dataIdsInSegments || !dataIdsInSegments.length) {
      return;
    }
    return segmentGroups.map(segmentGroup =>
      segmentGroup.reduce(
        (acc, segmentId) => acc.concat(dataIdsInSegments[segmentId]),
        []
      )
    );
  }
);

export const getSegmentedFeatures = createSelector(
  [getRawFeatureData, getDataIdsInSegmentGroups, getFeaturesMeta],
  (data, segments, featuresMeta) => {
    if (
      !segments ||
      segments.length === 0 ||
      !featuresMeta ||
      featuresMeta.length === 0
    ) {
      return null;
    }
    return featuresMeta.map(feature => {
      const segmentValues = segments.map(segment => {
        return segment.map(dataId => data[dataId][feature.name]);
      });
      return {
        ...feature,
        values: segmentValues,
      };
    });
  }
);

export const getFeatures = createSelector(
  getSegmentedFeatures,
  features => {
    if (!features || features.length === 0) {
      return null;
    }
    return features
      .map(feature => {
        const {values, domain, type} = feature;
        const histogramFunc =
          type === FEATURE_TYPE.CATEGORICAL
            ? computeHistogramCat
            : computeHistogram;
        // use same bins for every segmented distributions
        const T = histogramFunc(values[0], domain)[0];
        const C = histogramFunc(values[1], domain)[0];

        // todo: Figure out whether kldivergence need this normalization. If not, put into adaptors.
        const sumT = T.reduce((acc, d) => acc + d, 0);
        const sumC = C.reduce((acc, d) => acc + d, 0);

        // equalize both count distribution to [0, 1]
        const equalizedT = T.map(d => d / sumT);
        const equalizedC = C.map(d => d / sumC);

        const all = equalizedT.concat(equalizedC);
        const min = Math.min(...all) - 1e-9;
        const max = Math.max(...all);
        const range = max - min;

        const normT = equalizedT.map(d => (d - min) / range);
        const normC = equalizedC.map(d => (d - min) / range);
        const divergence = max === 0 ? 0 : kldivergence(normT, normC);

        return {
          ...feature,
          distributions: [T, C],
          distributionsNormalized: [normT, normC],
          divergence,
        };
      })
      .sort((fa, fb) => fb.divergence - fa.divergence);
  }
);
