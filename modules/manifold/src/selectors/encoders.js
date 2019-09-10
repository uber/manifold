// @noflow
import {createSelector} from 'reselect';
import {getFeatures} from './adaptors';

import {FILTER_TYPE, FEATURE_TYPE} from '../constants';

// ---------------------------------------------------------------------------- //
// ---- FEATURE ENCODERS ------------------------------------------------------ //
// ---------------------------------------------------------------------------- //

export const getCategoricalFeatureEncoders = createSelector(
  getFeatures,
  features => {
    if (!features || features.length === 0) {
      return [];
    }

    return features
      .filter(feature => feature.type === FEATURE_TYPE.CATEGORICAL)
      .reduce((encoders, feature) => {
        const {
          distribution: [T, C],
          divergence,
          domain,
          name,
          type,
        } = feature;
        // in case the data source has removed the @derived: prefix
        const source = name.includes('@derived:') ? name : `@derived:${name}`;
        const target = source.replace('@derived:', '@manifold:');
        return encoders.concat(
          domain.reduce(
            (encoder, value, i) => ({...encoder, [value]: T[i] - C[i]}),
            {
              type,
              source,
              target,
              divergence,
            }
          )
        );
      }, []);
  }
);

export const getNumericalFeatureEncoders = createSelector(
  getFeatures,
  features => {
    if (!features || features.length === 0) {
      return [];
    }

    return features
      .filter(feature => feature.type === FEATURE_TYPE.NUMERICAL)
      .reduce((encoders, feature) => {
        const {
          distribution: [T, C],
          divergence,
          domain,
          filter,
          name,
          type,
        } = feature;
        const hasRangeFilter = filter && filter.type === FILTER_TYPE.RANGE;
        const min = hasRangeFilter ? filter.value[0] : domain[0];
        const max = hasRangeFilter
          ? filter.value[1]
          : domain[domain.length - 1];
        // in case the data source has removed the @derived: prefix
        const source = name.includes('@derived:') ? name : `@derived:${name}`;
        const target = source.replace('@derived:', '@manifold:');
        // ---- TODO provide the step size from the backend instead ------------- //
        const step = feature.stepSize || domain[1] - domain[0];
        // ---- TODO ------------------------------------------------------------ //
        return encoders.concat(
          domain.reduce((encoder, _, i) => ({...encoder, [i]: T[i] - C[i]}), {
            type,
            source,
            target,
            divergence,
            min,
            max,
            step,
          })
        );
      }, []);
  }
);

export const getFeatureEncoders = createSelector(
  [getCategoricalFeatureEncoders, getNumericalFeatureEncoders],
  (categoricalEncoders, numericalEncoders) => {
    const [catEncoder = {}] = categoricalEncoders;
    const [numEncoder = {}] = numericalEncoders;
    const uniqKeys = [
      ...new Set(Object.keys(catEncoder).concat(Object.keys(numEncoder))),
    ];
    return categoricalEncoders.concat(numericalEncoders).map(encoder => {
      uniqKeys.forEach(key => {
        encoder[key] = encoder[key] || 0;
      });
      return encoder;
    });
  }
);
