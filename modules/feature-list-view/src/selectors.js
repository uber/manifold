import {createSelector} from 'reselect';
import {FEATURE_TYPE} from '@mlvis/mlvis-common/constants';
import {
  computeFeatureMeta,
  computeSegmentedFeatureDistributions,
  computeSegmentedFeatureDistributionsNormalized,
  computeDivergence,
} from '@mlvis/mlvis-common/utils';

export const featureSelector = props => props.data;

export const getFeatureName = createSelector(
  featureSelector,
  feature => feature.name
);

export const getFeatureValues = createSelector(
  featureSelector,
  feature => feature.values
);

// helper selector
const getFeatureMeta = createSelector(
  featureSelector,
  getFeatureValues,
  (feature, values) => {
    if (feature.type && feature.domain) {
      return {
        type: feature.type,
        domain: feature.domain,
      };
    }
    const allValues = values.reduce((acc, arr) => acc.concat(arr), []);
    const {type, domain} = computeFeatureMeta(feature.name, allValues);
    return {
      type,
      domain,
    };
  }
);

export const getFeatureType = createSelector(
  getFeatureMeta,
  feature => feature.type
);

export const getFeatureDomain = createSelector(
  getFeatureMeta,
  feature => feature.domain
);

export const getFeatureDistributions = createSelector(
  [featureSelector, getFeatureType, getFeatureDomain, getFeatureValues],
  (feature, type, domain, values) => {
    if (feature.distributions && feature.distributions.length) {
      return feature.distributions;
    }
    return computeSegmentedFeatureDistributions(type, domain, values);
  }
);

export const getDistributionsMaxValues = createSelector(
  [featureSelector, getFeatureDistributions],
  (feature, distributions) => {
    if (feature.distributionMaxValues) {
      return feature.distributionMaxValues;
    }
    return [Math.max(...distributions[0]), Math.max(...distributions[1])];
  }
);

export const getFeatureDistributionsNormalized = createSelector(
  [featureSelector, getFeatureDistributions],
  (feature, distributions) => {
    if (feature.distributionsNormalized) {
      return feature.distributionsNormalized;
    }
    return computeSegmentedFeatureDistributionsNormalized(distributions);
  }
);

export const getFeatureDivergence = createSelector(
  [featureSelector, getFeatureDistributionsNormalized],
  (feature, distributions) => {
    if (feature.divergence !== undefined) {
      return feature.divergence;
    }
    return computeDivergence(distributions);
  }
);

export const getCategoriesSortedOrder = createSelector(
  [getFeatureType, getFeatureDistributionsNormalized],
  (type, distributions) => {
    if (type !== FEATURE_TYPE.CATEGORICAL) {
      return null;
    }
    const [dist0, dist1] = distributions;
    return Array.from(Array(dist0.length))
      .map((_, i) => i)
      .sort((a, b) => {
        const deltaA = dist0[a] - dist1[a];
        const deltaB = dist0[b] - dist1[b];
        return deltaA > deltaB ? 1 : -1;
      });
  }
);
