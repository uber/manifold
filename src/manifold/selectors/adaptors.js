import {createSelector} from 'reselect';
import {dotRange} from 'packages/mlvis-common/utils';
import {getDivergenceThreshold, getMetric} from './base';
import {getModelsMeta, getFeaturesMeta} from './compute';
import {getModelsPerformance, getFeaturesDistribution} from './data';
// ------------------------------------------------------------------------------------------- //
// -- THE ADAPTOR SELECTORS DO NECESSARY TRANSFORMATION TO THE OUTPUTS OF THE DATA SELECTOR -- //
// ------------------------------------------------------------------------------------------- //

// segment filters
export const getSegmentFilterAttributes = createSelector(
  getFeaturesMeta,
  featuresMeta => {
    if (!featuresMeta) {
      return null;
    }
    return featuresMeta.map(feature => {
      const {name, type, domain, histogram} = feature;
      return {
        key: name,
        type,
        domain,
        distribution: histogram,
      };
    });
  }
);

// models performance
export const getModels = getModelsPerformance;

export const getRawDataRange = createSelector(
  getModelsPerformance,
  perfBySegment => {
    if (!perfBySegment) {
      return null;
    }
    let min = Infinity;
    let max = -Infinity;
    perfBySegment.forEach(({data = []}) => {
      data.forEach(({percentiles}) => {
        if (percentiles[0] < min) {
          min = percentiles[0];
        }
        if (percentiles[percentiles.length - 1] > max) {
          max = percentiles[percentiles.length - 1];
        }
      });
    });
    return [min, max];
  }
);

// density range by segment
export const getDensityRange = createSelector(
  getModelsPerformance,
  perfBySegment => {
    if (!perfBySegment) {
      return null;
    }
    const densityRange = Array(perfBySegment.length).fill([]);
    perfBySegment.forEach(({segmentId, data}) => {
      densityRange[segmentId] = [0, -Infinity];
      data.forEach(singleModelData => {
        const {
          density: [densityVals],
        } = singleModelData;
        const localMax = Math.max(...densityVals);
        if (localMax > densityRange[segmentId][1]) {
          densityRange[segmentId][1] = localMax;
        }
      });
    });
    return densityRange;
  }
);

export const getModelIds = createSelector(
  getModelsPerformance,
  perfBySegment => {
    if (!perfBySegment) {
      return null;
    }
    const {data = []} = perfBySegment[0];
    return dotRange(data.length);
  }
);

// todo: use real model names / allow users to set model names
export const getModelMeta = createSelector(
  getModelsPerformance,
  perfBySegment => {
    if (!perfBySegment) {
      return null;
    }
    const {data = []} = perfBySegment[0];
    return data.map((d, i) => ({
      id: i,
      name: d.modelName || `model_${i}`,
    }));
  }
);

// features distribution
export const getFeatures = createSelector(
  [getFeaturesDistribution, getDivergenceThreshold],
  (rawFeatures, threshold) => {
    if (!rawFeatures) {
      return null;
    }

    return rawFeatures.filter(feature => feature.divergence >= threshold);
  }
);

export const getDisplayMetric = createSelector(
  [getMetric, getModelsMeta],
  (metric, meta) => {
    if (!meta) {
      return null;
    }
    const {nClasses} = meta;
    switch (metric) {
      case 'actual':
        return 'actual';
      case 'performance':
        return isNaN(nClasses)
          ? 'unknown'
          : nClasses >= 2
          ? 'log_loss'
          : 'squared_error';
      default:
        return 'unknown';
    }
  }
);
