import {createSelector} from 'reselect';

import {
  dotRange,
  computeClusters,
  computeDensity,
  computeSegmentedFeatureDistributions,
  computeSegmentedFeatureDistributionsNormalized,
  computeDivergence,
  computePercentiles,
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
import {
  sliceDataset,
  gatherDataset,
  filterDataset,
  computeSortedOrder,
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

// return a list of column ids to include in the clustering
// to do: make it flexible / adjustible
export const getClusteringInputColumnIds = createSelector(
  [getColumnTypeRanges, getModelsMeta, getBaseModels, getMetric],
  columnTypeRanges => {
    if (!columnTypeRanges) {
      return null;
    }
    return dotRange(...columnTypeRanges.score);
  }
);

// return a sub dataset to include in the clustering
export const getClusteringInputDataset = createSelector(
  [getData, getClusteringInputColumnIds],
  (data, colIds) => {
    if (!data || !colIds) {
      return null;
    }
    return gatherDataset(data, colIds);
  }
);

// return an array of array of ids representing data rows in each cluster
// e.g. [[0, 5, 6], [3, 4], [1, 2, 7]]
export const getDataIdsInSegmentsUnsorted = createSelector(
  [getClusteringInputDataset, getData, getNClusters, getSegmentFilters],
  (clusteringInput, allData, nClusters = 4, segmentFilters) => {
    if (!clusteringInput || !allData) {
      return null;
    }
    if (segmentFilters && segmentFilters.length) {
      return segmentFilters.map(filter => filterDataset(allData, filter));
    }
    const {columns} = clusteringInput;
    const clusterIds = computeClusters(columns, nClusters, true);
    // todo: simplify the following ligic. `clusterIds` representation is sufficient
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
  [getClusteringInputDataset, getDataIdsInSegmentsUnsorted],
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
