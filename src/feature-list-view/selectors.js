// @noflow
// todo: utilize tenforflow to speed up histogram computation
import {createSelector} from 'reselect';
import {COLOR} from '@uber/mlvis-common/constants';
import {
  computeFeatureMeta,
  computeSegmentedFeatureDistributions,
  computeSegmentedFeatureDistributionsNormalized,
  computeDivergence,
} from '@uber/mlvis-common/utils';

export const featureSelector = props => props.feature;

export const getFeatureName = createSelector(
  featureSelector,
  feature => feature.name
);

export const getFeatureColors = createSelector(
  featureSelector,
  feature => feature.colors || [COLOR.GREEN, COLOR.PURPLE]
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
    const {type, domain} = computeFeatureMeta(allValues);
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
