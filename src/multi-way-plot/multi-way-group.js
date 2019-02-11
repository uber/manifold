// @noflow
import React, {PureComponent} from 'react';
import MultiWayUnit from './multi-way-unit';

export default class MultiWayGroup extends PureComponent {
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

  _renderMultiWayUnit = () => {
    const {
      xScale,
      yScale,
      colorScale,
      data,
      width,
      height,
      selectedModels,
    } = this.props;
    const {modelsPerformance} = data;
    return (
      <g id="segment">
        {modelsPerformance.map((m, i) => (
          <MultiWayUnit
            id={m.modelId}
            key={i}
            data={m}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            selectedModels={selectedModels}
            width={width}
            height={height}
          />
        ))}
      </g>
    );
  };

  _renderLabel = () => {
    const {
      data: {numDataPoints},
      width,
      id,
    } = this.props;

    return (
      <g id="patterns">
        <line
          strokeDasharray="5, 10"
          strokeWidth="1"
          stroke="#AAA"
          x1="0"
          y1="0"
          x2={width}
          y2="0"
        />
        <text
          x={width}
          dy={4}
          fill="#AAA"
          textAnchor="end"
          alignmentBaseline="hanging"
        >
          {`${id} (${numDataPoints} data points)`}
        </text>
      </g>
    );
  };

  render = () => {
    const {y = 0} = this.props;

    return (
      <g transform={`translate(0, ${y})`} style={{transition: '0.5s linear'}}>
        {this._renderMultiWayUnit()}
        {this._renderLabel()}
      </g>
    );
  };
}
