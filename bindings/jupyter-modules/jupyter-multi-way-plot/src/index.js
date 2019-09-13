import React from 'react';
import {scaleLinear, scaleBand, scaleOrdinal} from 'd3-scale';
import {schemeSet2 as colorScheme} from 'd3-scale-chromatic';
import MultiWayPlot from '@mlvis/multi-way-plot';

// TODO: Pass real functions from Python to Javascript
export default props => (
  <MultiWayPlot
    {...props}
    getXScale={scaleLinear}
    getXDomain={() => [0, 12]}
    getYScale={() => scaleBand().padding(0.1)}
    getYDomain={() => [0, 1, 2]}
    colorScale={scaleOrdinal(colorScheme).domain([0, 1])}
  />
);
