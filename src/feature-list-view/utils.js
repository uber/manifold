// @noflow
import React from 'react';
import {
  getFeatureName,
  getFeatureType,
  getFeatureColors,
  getFeatureDomain,
  getFeatureDistributions,
  getFeatureDistributionsNormalized,
  getFeatureDivergence,
} from './selectors';

export const pointsToPolyline = (points, dx, dy) => {
  const polyline = points.map(
    (val, i) => `${(dx * i).toFixed(1)},${(val * dy).toFixed(1)}`
  );
  return `0,0 ${polyline.join(' ')} ${(points.length + 1) * dx},0`;
};

/**
 * HOC function to check if feature meta is precomputed, if not, compute and inject result
 */
export const withDerivedData = FeatureView => props => {
  const {feature} = props;
  const featureWithDerivedData = {
    ...feature,
    name: getFeatureName(props),
    type: getFeatureType(props),
    colors: getFeatureColors(props),
    domain: getFeatureDomain(props),
    distributions: getFeatureDistributions(props),
    distributionsNormalized: getFeatureDistributionsNormalized(props),
    divergence: getFeatureDivergence(props),
  };

  return <FeatureView {...props} feature={featureWithDerivedData} />;
};
