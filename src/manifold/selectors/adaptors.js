// @noflow
import {createSelector} from 'reselect';
import {getDivergenceThreshold, getMetric, getIsLocalDataLoading} from './base';
import {
  getMetaData,
  getModelsPerformance,
  getFeaturesDistribution,
} from './data';

const COLOR = {
  T: '#ff0099',
  C: '#999999',
};

// ------------------------------------------------------------------------------------------- //
// -- THE ADAPTOR SELECTORS DO NECESSARY TRANSFORMATION TO THE OUTPUTS OF THE DATA SELECTOR -- //
// ------------------------------------------------------------------------------------------- //

export const isComputing = createSelector(
  [getIsLocalDataLoading, getModelsPerformance, getFeaturesDistribution],
  (isLocalDataLoading, modelsPerformance = [], featuresDistribution = []) => {
    return (
      isLocalDataLoading &&
      (!modelsPerformance.length || !featuresDistribution.length)
    );
  }
);

// segment filters
export const getSegmentFilterAttributes = createSelector(
  getMetaData,
  (meta = {}) => {
    const {featuresMeta = []} = meta;
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
  data => {
    if (!data) {
      return [];
    }
    let min = Infinity;
    let max = -Infinity;
    data.forEach(({modelsPerformance = []}) => {
      modelsPerformance.forEach(({percentiles}) => {
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
  data => {
    if (!data) {
      return null;
    }
    const densityRange = {};
    data.forEach(({segmentId, modelsPerformance}) => {
      densityRange[segmentId] = [0, -Infinity];
      modelsPerformance.forEach(m => {
        /* eslint-disable no-unused-vars */
        const {
          density: [_, densityVals],
        } = m;
        /* eslint-enable no-unused-vars */
        const localMax = Math.max(...densityVals);
        if (localMax > densityRange[segmentId][1]) {
          densityRange[segmentId][1] = localMax;
        }
      });
    });
    return densityRange;
  }
);

export const getSegmentIds = createSelector(
  getModelsPerformance,
  data => {
    if (!data || data.length === 0) {
      return [];
    }
    return data.map(d => d.segmentId);
  }
);

export const getModelIds = createSelector(
  getModelsPerformance,
  data => {
    if (!data || data.length === 0) {
      return [];
    }
    const {modelsPerformance = []} = data[0];
    return modelsPerformance.map(d => d.modelId);
  }
);

export const getModelMeta = createSelector(
  getModelsPerformance,
  data => {
    if (!data || data.length === 0) {
      return [];
    }
    const {modelsPerformance = []} = data[0];
    return modelsPerformance.map(d => ({
      id: d.modelId,
      name: d.modelName,
    }));
  }
);

// features distribution
export const getFeatures = createSelector(
  [getFeaturesDistribution, getDivergenceThreshold],
  (rawFeatures, threshold) => {
    if (!rawFeatures || rawFeatures.length === 0) {
      return null;
    }

    return rawFeatures
      .filter(feature => feature.divergence >= threshold)
      .map(feature => {
        return {
          ...feature,
          // todo: input colors from the application side
          colors: [COLOR.T, COLOR.C],
        };
      });
  }
);

export const getDisplayMetric = createSelector(
  getMetric,
  getMetaData,
  (metric, meta = {}) => {
    const {modelsMeta: {nClasses} = {}} = meta;
    switch (metric) {
      case 'actual':
        return 'actual';
      case 'performance':
        return isNaN(nClasses)
          ? 'unknown'
          : nClasses >= 2
          ? 'log_loss'
          : 'squared_log_error';
      default:
        return 'unknown';
    }
  }
);
