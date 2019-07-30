import React from 'react';
import {getPercentiles, getDensity, getNumDataPoints} from './selectors';

/**
 * HOC function to compute derived data for multi-way-unit, multi-way-group, and multi-way-plot
 */
export const withDerivedDataUnit = WrappedComponent => props => {
  const derivedData = {
    percentiles: getPercentiles(props),
    density: getDensity(props),
  };
  return <WrappedComponent {...props} {...derivedData} />;
};

export const withDerivedDataGroup = WrappedComponent => props => {
  const derivedData = {
    numDataPoints: getNumDataPoints(props),
  };
  return <WrappedComponent {...props} {...derivedData} />;
};
