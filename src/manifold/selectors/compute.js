// @noflow
import {createSelector} from 'reselect';

import {
  dotRange,
  computeClusters,
  computeDensity,
  computeSegmentedFeatureDistributions,
  computeSegmentedFeatureDistributionsNormalized,
  computeDivergence,
  computePercentiles,
  logLoss,
  absoluteError,
} from 'packages/mlvis-common/utils';
import {FEATURE_TYPE} from 'packages/mlvis-common/constants';

import {
  rootSelector,
  getMetric,
  getNClusters,
  getSegmentFilters,
  getSegmentGroups,
  getBaseModels,
  getIsManualSegmentation,
} from './base';
import {filterData, computeSortedOrder, groupLatLngPairs} from '../utils';

import {METRIC, PERF_PREFIX, ACTUAL_PREFIX} from '../constants';

const MODEL_PERF_HISTOGRAM_RESOLUTION = 50;
const PERCENTILE_LIST = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

// ---------------------------------------------------------------------------- //
// ---- THE COMPUTE SELECTORS DO ALL THE DATA TRANSFORMATION IN THE FRONT-END ---- //
// ---------------------------------------------------------------------------- //

// ------------------------------------------------------------------------- //
// --------------------------- DATA FROM REDUX STATE ----------------------- //
// ------------------------------------------------------------------------- //

const getX = createSelector(
  rootSelector,
  state => state.x
);

const getYPred = createSelector(
  rootSelector,
  state => state.yPred
);

const getYTrue = createSelector(
  rootSelector,
  state => state.yTrue
);

export const getModelsMeta = createSelector(
  rootSelector,
  state => state.modelsMeta
);

export const getFeaturesMeta = createSelector(
  rootSelector,
  state => state.featuresMeta
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
  [getYPred, getYTrue, getModelsMeta],
  (yPred, yTrue, modelsMeta) => {
    if (!yPred.length || !yPred[0].length || !yTrue.length || !modelsMeta) {
      return [];
    }
    const {nClasses = 2, classLabels = []} = modelsMeta;
    // regression vs classification
    const perfFunc = nClasses === 1 ? absoluteError : logLoss;
    // performance arrays by model
    // TODO: transform the data to array of arrays during data loading action
    const perfCols = yPred.map(singleModelPredArr => {
      const predictArr = singleModelPredArr.map(instance =>
        classLabels.map(classCol => instance[classCol])
      );
      return perfFunc(yTrue, predictArr, classLabels);
    });

    return yTrue.map((_, dataId) => {
      return yPred.reduce((acc, singleModelPredArr, modelId) => {
        classLabels.forEach((classCol, classId) => {
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

export const getDataIdsInSegmentsUnsorted = createSelector(
  [getClusteringInput, getX, getNClusters, getSegmentFilters],
  (clusteringInput = [], features, nClusters = 4, segmentFilters) => {
    if (!clusteringInput.length || !clusteringInput[0].length) {
      return [];
    }
    if (segmentFilters && segmentFilters.length) {
      // todo: merge rawPred, rawFeatures, and clusteringInput for manual filters
      return segmentFilters.map(filter => filterData(features, filter));
    }
    const clusterIds = computeClusters(clusteringInput, nClusters);
    const result = [];
    for (let i = 0; i < nClusters; i++) {
      result.push([]);
    }
    for (let i = 0; i < clusterIds.length; i++) {
      result[clusterIds[i]].push(i);
    }
    return result.filter(r => r.length > 0);
  }
);

export const getModelPerfHistogramsUnsorted = createSelector(
  [getDataPerformance, getDataIdsInSegmentsUnsorted, getModelsMeta, getMetric],
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
        ? dotRange(nModels).map(m => PERF_PREFIX + m)
        : dotRange(nModels).map(m => ACTUAL_PREFIX + m + '_0');

    return segmentedIds.map(segment => {
      // histograms of performance grouped by model, grouped by segment
      const perfHistogram = modelKeyArr.map(modelId => {
        const segmentedPerfArr = segment.map(
          dataId => perfArr[dataId][modelId]
        );
        return {
          density: computeDensity(
            segmentedPerfArr,
            MODEL_PERF_HISTOGRAM_RESOLUTION
          ),
          // "percentiles" includes [.01, .1, .25, .5, .75, .9, .99] percentiles of model performance
          percentiles: computePercentiles(segmentedPerfArr, PERCENTILE_LIST),
        };
      });
      return {
        numDataPoints: segment.length,
        dataIds: segment,
        data: perfHistogram,
      };
    });
  }
);

export const getSegmentsSortedOrder = createSelector(
  getModelPerfHistogramsUnsorted,
  segments => {
    if (!segments || !segments.length) {
      return null;
    }
    // sort by the median performance of the first model.
    const sortingFunc = cluster => cluster.data[0].percentiles[3];
    return computeSortedOrder(segments, sortingFunc);
  }
);

export const getModelPerfHistograms = createSelector(
  [getModelPerfHistogramsUnsorted, getSegmentsSortedOrder],
  (segments, order) => {
    if (!segments || !segments.length) {
      return null;
    }
    const result = order.map(id => segments[id]);
    // reassign segment ids after sorting
    result.forEach((segment, segmentId) => {
      segment.segmentId = segmentId;
    });
    return result;
  }
);

// ------------------------------------------------------------------------- //
// ---------------------- FEATURE DISTRIBUTION VIEW ------------------------ //
// ------------------------------------------------------------------------- //
export const getDataIdsInSegments = createSelector(
  [
    getDataIdsInSegmentsUnsorted,
    getIsManualSegmentation,
    getSegmentsSortedOrder,
  ],
  (segments, isManual, order) => {
    if (!segments || !segments.length) {
      return null;
    }
    if (!isManual) {
      return order.map(id => segments[id]);
    }
    return segments;
  }
);

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

export const getSegmentedRawFeatures = createSelector(
  [getX, getDataIdsInSegmentGroups],
  (data, segments) => {
    if (!segments || segments.length === 0) {
      return null;
    }
    return segments.map(segment => {
      return segment.map(dataId => data[dataId]);
    });
  }
);

export const getSegmentedFeatures = createSelector(
  [getSegmentedRawFeatures, getFeaturesMeta],
  (segments, featuresMeta) => {
    if (
      !segments ||
      segments.length === 0 ||
      !featuresMeta ||
      featuresMeta.length === 0
    ) {
      return null;
    }
    return featuresMeta
      .filter(feature =>
        [FEATURE_TYPE.CATEGORICAL, FEATURE_TYPE.NUMERICAL].includes(
          feature.type
        )
      )
      .map(feature => {
        const {domain, type} = feature;
        const segmentValues = segments.map(segment => {
          return segment.map(d => d[feature.tableFieldIndex - 1]);
        });

        const distributions = computeSegmentedFeatureDistributions(
          type,
          domain,
          segmentValues
        );
        const distributionsNormalized = computeSegmentedFeatureDistributionsNormalized(
          distributions
        );
        const divergence = computeDivergence(distributionsNormalized);

        return {
          ...feature,
          values: segmentValues,
          distributions,
          distributionsNormalized,
          divergence,
        };
      })
      .sort((fa, fb) => fb.divergence - fa.divergence);
  }
);

export const getGroupedGeoFeatures = createSelector(
  getFeaturesMeta,
  features => {
    const geoFields = features.filter(
      feature => feature.type === FEATURE_TYPE.GEO
    );
    return groupLatLngPairs(geoFields);
  }
);
