// @noflow
import React, {PureComponent} from 'react';
import {Array} from 'global';
import {area} from 'd3-shape';

export default class MultiWayUnit extends PureComponent {
  static defaultProps = {
    width: 0,
    height: 0,
    xScale: d => d,
    yScale: d => d,
    data: {},
  };

  state = {
    hoveredId: null,
  };

  _renderDistribution = () => {
    const {
      id,
      data: {density},
      xScale,
      yScale,
      colorScale,
      selectedModels,
    } = this.props;

    const areaFunc = area()
      .x(i => xScale(density[0][i]))
      .y0(i => yScale(density[1][i]))
      .y1(i => -1 * yScale(density[1][i]));
    const arrRange = Array.from(Array(density[0].length).keys());

    return (
      <g transform={`translate(0, 0) scale(1,-1)`}>
        <path
          d={areaFunc(arrRange)}
          stroke={colorScale(id)}
          strokeWidth={2}
          strokeOpacity={selectedModels[id] ? 1 : 0.5}
          fillOpacity={0}
        />
      </g>
    );
  };

  _renderSummary = () => {
    const {
      id,
      xScale,
      data: {percentiles},
      colorScale,
      selectedModels,
    } = this.props;

    return (
      <g id="summary" fill="none" pointerEvents="all">
        <rect
          key={0}
          x={xScale(percentiles[2])}
          y={-1}
          width={xScale(percentiles[4]) - xScale(percentiles[2])}
          height={2}
          fill={colorScale(id)}
          fillOpacity={selectedModels[id] ? 1 : 0.5}
        />
        <rect
          key={1}
          x={xScale(percentiles[3]) - 1}
          y={-5}
          width={2}
          height={10}
          fill={colorScale(id)}
          fillOpacity={selectedModels[id] ? 1 : 0.5}
        />
      </g>
    );
  };

  render = () => {
    const {
      width,
      height,
      data: {percentiles, density},
    } = this.props;
    if (width <= 0 || height <= 0 || !percentiles || !density) {
      return null;
    }

    return (
      <g>
        {this._renderDistribution()}
        {this._renderSummary()}
      </g>
    );
  };
}
