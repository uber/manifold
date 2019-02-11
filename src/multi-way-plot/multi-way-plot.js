// @noflow
import React, {PureComponent} from 'react';
import {scaleLinear} from 'd3-scale';
import MultiWayGroup from './multi-way-group';
import {Axis, axisPropsFromTickScale} from 'react-d3-axis';

const FONT_STYLE = {
  fontSize: 12,
};

export default class MultiWayPlot extends PureComponent {
  static defaultProps = {
    width: 0,
    height: 0,
    xScale: d => d,
    yScale: d => d,
    data: [],
  };

  _renderAxis = () => {
    const {padding, width, height, xScale, xLabel} = this.props;
    return (
      <g transform={`translate(${padding.left}, ${height - 32})`}>
        <Axis
          {...axisPropsFromTickScale(xScale, 10)}
          style={{strokeColor: '#666'}}
        />
        <text x={width * 0.5} y={28} textAnchor="middle" fill="#666">
          {xLabel}
        </text>
      </g>
    );
  };

  _renderMultiWayGroup = () => {
    const {
      padding,
      xScale,
      yScale,
      yScaleGroupRange,
      colorScale,
      data,
      ordering,
      selectedModels,
    } = this.props;
    const groupContent = data.map((segment, i) => {
      const {segmentId} = segment;
      const order = ordering.indexOf(i);
      const yScaleGroup = scaleLinear()
        .domain(yScaleGroupRange[segmentId])
        .range([0, 0.5 * yScale.bandwidth()]);
      const layout = {
        y: yScale(order) + 0.5 * yScale.bandwidth(),
        width: xScale.range()[1],
        height: yScale.bandwidth(),
      };
      return (
        <MultiWayGroup
          key={segmentId}
          id={segmentId}
          data={segment}
          xScale={xScale}
          yScale={yScaleGroup}
          colorScale={colorScale}
          selectedModels={selectedModels}
          {...layout}
        />
      );
    });
    return (
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {' '}
        {groupContent}{' '}
      </g>
    );
  };

  render() {
    const {width, height, data} = this.props;
    if (width <= 0 || height <= 0 || !data) {
      return null;
    }
    return (
      <svg width={width} height={height} {...FONT_STYLE} pointerEvents="none">
        {this._renderMultiWayGroup()}
        {this._renderAxis()}
      </svg>
    );
  }
}
