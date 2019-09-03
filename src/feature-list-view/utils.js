import React from 'react';
import {scaleLinear} from 'd3-scale';
import {RIGHT_MARGIN_WIDTH} from './constants';
import {
  getFeatureName,
  getFeatureType,
  getFeatureDomain,
  getFeatureDistributions,
  getDistributionsMaxValues,
  getFeatureDistributionsNormalized,
  getFeatureDivergence,
  getCategoriesSortedOrder,
} from './selectors';

export const pointsToPolyline = (points, dx, dy) => {
  const polyline = points.map(
    (val, i) => `${(dx * i).toFixed(1)},${(val * dy).toFixed(1)}`
  );
  return `0,0 ${polyline.join(' ')} ${points.length * dx},0`;
};

/**
 * HOC function to check if feature meta is precomputed, if not, compute and inject result
 */
export const withDerivedData = FeatureView => props => {
  const {data, width} = props;
  const featureWithDerivedData = {
    ...data,
    name: getFeatureName(props),
    type: getFeatureType(props),
    domain: getFeatureDomain(props),
    distributions: getFeatureDistributions(props),
    distributionsNormalized: getFeatureDistributionsNormalized(props),
    distributionsMaxValues: getDistributionsMaxValues(props),
    divergence: getFeatureDivergence(props),
    // for categorical features only
    categoriesSortedOrder: getCategoriesSortedOrder(props),
  };

  const xScale = scaleLinear()
    .domain([
      featureWithDerivedData.domain[0],
      featureWithDerivedData.domain[featureWithDerivedData.domain.length - 1],
    ])
    .range([0, width - RIGHT_MARGIN_WIDTH]);

  return (
    <FeatureView {...props} data={featureWithDerivedData} xScale={xScale} />
  );
};
