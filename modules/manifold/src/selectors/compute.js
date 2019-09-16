import {createSelector} from 'reselect';
import assert from 'assert';

import {
  computeDensity,
  computeSegmentedFeatureDistributions,
  computeSegmentedFeatureDistributionsNormalized,
  computeDivergence,
  computePercentiles,
} from '@mlvis/mlvis-common/utils';
import {FEATURE_TYPE} from '@mlvis/mlvis-common/constants';

import {
  rootSelector,
  getMetric,
  getNClusters,
  getSegmentFilters,
  getSegmentGroups,
  getBaseCols,
  getIsManualSegmentation,
} from './base';
import {
  sliceDataset,
  computeSortedOrder,
  computeManualSegmentationResult,
  computeAutoSegmentationResult,
} from '../utils';

const MODEL_PERF_HISTOGRAM_RESOLUTION = 50;
const PERCENTILE_LIST = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

// ---------------------------------------------------------------------------- //
// ---- THE COMPUTE SELECTORS DO ALL THE DATA TRANSFORMATION IN THE FRONT-END ---- //
// ---------------------------------------------------------------------------- //

// ------------------------------------------------------------------------- //
// --------------------------- DATA FROM REDUX STATE ----------------------- //
// ------------------------------------------------------------------------- //

export const getData = createSelector(
  rootSelector,
  state => state.data
);

export const getColumnTypeRanges = createSelector(
  rootSelector,
  state => state.columnTypeRanges
);

export const getX = createSelector(
  getData,
  getColumnTypeRanges,
  (data, columnTypeRanges) => {
    if (!data || !columnTypeRanges) {
      return null;
    }
    return sliceDataset(data, columnTypeRanges.x);
  }
);

export const getYPred = createSelector(
  getData,
  getColumnTypeRanges,
  (data, columnTypeRanges) => {
    if (!data || !columnTypeRanges) {
      return null;
    }
    return sliceDataset(data, columnTypeRanges.yPred);
  }
);

export const getYTrue = createSelector(
  getData,
  getColumnTypeRanges,
  (data, columnTypeRanges) => {
    if (!data || !columnTypeRanges) {
      return null;
    }
    return sliceDataset(data, columnTypeRanges.yTrue);
  }
);

export const getScore = createSelector(
  getData,
  getColumnTypeRanges,
  (data, columnTypeRanges) => {
    if (!data || !columnTypeRanges) {
      return null;
    }
    return sliceDataset(data, columnTypeRanges.score);
  }
);

export const getModelsMeta = createSelector(
  rootSelector,
  state => state.modelsMeta
);

export const getFeaturesMeta = createSelector(
  getX,
  x => {
    if (!x) {
      return null;
    }
    return x.fields;
  }
);

export const getMetaDataFromRaw = createSelector(
  [getModelsMeta, getFeaturesMeta],
  (modelsMeta, featuresMeta) => {
    if (!modelsMeta || !featuresMeta) {
      return null;
    }
    return {
      modelsMeta,
      featuresMeta,
    };
  }
);

// ------------------------------------------------------------------------- //
// ---------------------- PERFORMANCE COMPARISON VIEW ------------------------ //
// ------------------------------------------------------------------------- //

// return an array of array of ids representing data rows in each cluster
// e.g. [[0, 5, 6], [3, 4], [1, 2, 7]]
export const getDataIdsInSegmentsUnsorted = createSelector(
  [
    getData,
    getColumnTypeRanges,
    getIsManualSegmentation,
    getNClusters,
    getSegmentFilters,
  ],
  (data, columnTypeRanges, isManual, nClusters, segmentFilters) => {
    if (!data || !columnTypeRanges) {
      return null;
    }
    // todo: add `baseCols` in this logic
    if (isManual) {
      assert(
        segmentFilters && segmentFilters.length && segmentFilters[0].length,
        'must provide `segmentFilters` for manual segmentation'
      );
      return computeManualSegmentationResult(data, segmentFilters);
    } else {
      assert(
        !isNaN(nClusters) && nClusters !== null,
        'must provide `nClusters for automatic segmentation'
      );
      return computeAutoSegmentationResult(data, columnTypeRanges, nClusters);
    }
  }
);

export const getModelPerfHistogramsUnsorted = createSelector(
  // todo: score to display is different from score to segment on
  [getScore, getDataIdsInSegmentsUnsorted],
  (data, segmentedIds) => {
    if (!data || !segmentedIds) {
      return null;
    }
    const {columns: modelScoreCols} = data;

    return segmentedIds.map(idArr => {
      // histograms of performance grouped by model, grouped by segment
      const perfHistogram = modelScoreCols.map(col => {
        const segmentedScoreArr = idArr.map(dataId => col[dataId]);
        return {
          density: computeDensity(
            segmentedScoreArr,
            MODEL_PERF_HISTOGRAM_RESOLUTION
          ),
          // "percentiles" includes [.01, .1, .25, .5, .75, .9, .99] percentiles of model performance
          percentiles: computePercentiles(segmentedScoreArr, PERCENTILE_LIST),
        };
      });
      return {
        numDataPoints: idArr.length,
        dataIds: idArr,
        data: perfHistogram,
      };
    });
  }
);

export const getSegmentsSortedOrder = createSelector(
  getModelPerfHistogramsUnsorted,
  segments => {
    if (!segments) {
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
    if (!segments || !order) {
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
    if (!segments || !order) {
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
    if (!dataIdsInSegments || !segmentGroups) {
      return null;
    }
    return segmentGroups.map(segmentGroup =>
      segmentGroup.reduce(
        (acc, segmentId) => acc.concat(dataIdsInSegments[segmentId]),
        []
      )
    );
  }
);

export const getSegmentedCatNumFeatures = createSelector(
  [getX, getColumnTypeRanges, getDataIdsInSegmentGroups],
  (x, columnTypeRanges, idsInGroups) => {
    if (!x || !columnTypeRanges || !idsInGroups) {
      return null;
    }
    const {columns, fields} = x;
    const {
      x: [xColIdStart = 1],
    } = columnTypeRanges;
    return fields
      .filter(feature =>
        [FEATURE_TYPE.CATEGORICAL, FEATURE_TYPE.NUMERICAL].includes(
          feature.type
        )
      )
      .map(feature => {
        const {domain, type, tableFieldIndex} = feature;
        const segmentValues = idsInGroups.map(dataIds => {
          return dataIds.map(
            id => columns[tableFieldIndex - xColIdStart - 1][id]
          );
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
