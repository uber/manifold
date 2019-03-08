// @noflow
import React from 'react';
import {scaleBand, scaleLinear} from 'd3-scale';

/**
 * HOC function to check if feature meta is precomputed, if not, compute and inject result
 */
export const withDerivedData = Chart => props => {
  const {width, height, rawDataRange, segmentIds, padding} = props;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const derivedData = {
    xScale: scaleLinear()
      .domain(rawDataRange)
      .range([0, innerWidth]),
    yScale: scaleBand()
      .domain(segmentIds)
      .range([innerHeight, 0])
      .padding(0.1),
  };

  return <Chart {...props} {...derivedData} />;
};
