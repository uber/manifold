// @noflow
// todo: utilize tenforflow to speed up histogram computation
import {createSelector} from 'reselect';
import {kldivergence} from 'mathjs';
import {COLOR, FEATURE_TYPE} from '@uber/mlvis-common/constants';
import {
  computeHistogram,
  computeHistogramCat,
  computeFeatureMeta,
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
    if (![FEATURE_TYPE.CATEGORICAL, FEATURE_TYPE.NUMERICAL].includes(type)) {
      throw new Error('unknown or invalid feature type: ', type);
    }
    const histogramFunc =
      type === FEATURE_TYPE.CATEGORICAL
        ? computeHistogramCat
        : computeHistogram;
    // use same bins for every segmented distributions
    // use `[0]` to get only histogram values and not domains
    const T = histogramFunc(values[0], domain)[0];
    const C = histogramFunc(values[1], domain)[0];
    return [T, C];
  }
);

export const getFeatureDistributionsNormalized = createSelector(
  [featureSelector, getFeatureDistributions],
  (feature, distributions) => {
    if (feature.distributionsNormalized) {
      return feature.distributionsNormalized;
    }
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
);

export const getFeatureDivergence = createSelector(
  [featureSelector, getFeatureDistributionsNormalized],
  (feature, distributions) => {
    if (feature.divergence !== undefined) {
      return feature.divergence;
    }
    if (distributions[0].length === distributions[1].length) {
      return kldivergence(distributions[0], distributions[1]);
    }
    return Number.MAX_SAFE_INTEGER;
  }
);
