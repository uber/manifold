import React, {PureComponent} from 'react';
import {interpolatePiYG} from 'd3-scale-chromatic';
import {scaleLinear} from 'd3-scale';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_WIDGET_WIDTH = 500;
const DEFAULT_WIDGET_HEIGHT = 500;
const DEFAULT_CELL_WIDTH = 72;
const DEFAULT_CELL_HEIGHT = 16;
const PADDING = 2;

export default class StackedCalendar extends PureComponent {
  static defaultProps = {
    cellWidth: DEFAULT_CELL_WIDTH,
    cellHeight: DEFAULT_CELL_HEIGHT,
    width: DEFAULT_WIDGET_WIDTH,
    height: DEFAULT_WIDGET_HEIGHT,
    data: [],
    colorScale: () => 0,
  };

  _renderColumnLabels = () => {
    const {cellWidth, cellHeight} = this.props;
    const columnLabels = DAYS.map((day, i) => (
      <text
        key={i}
        x={cellWidth * (i + 1) + cellWidth / 2}
        y={cellHeight - 4}
        fontSize={12}
        textAnchor="middle"
      >
        {day}
      </text>
    ));

    return <g>{columnLabels}</g>;
  };

  _renderRowLabels = () => {
    const {cellWidth, cellHeight} = this.props;

    const rowLabels = Array.from(Array(24)).map((_, i) => (
      <text
        key={i}
        x={cellWidth - 4}
        y={cellHeight * (i + 1) + cellHeight / 2 + 2}
        fontSize={12}
        textAnchor="end"
        alignmentBaseline="middle"
      >
        {`${i === 12 ? 12 : i % 12}${i < 12 ? 'am' : 'pm'}`}
      </text>
    ));

    return <g>{rowLabels}</g>;
  };

  _renderLegend = () => {
    const {
      cellWidth,
      cellHeight,
      valueRange: [min, max],
    } = this.props;

    const legendGradient = (
      <linearGradient id="legend-gradient">
        {Array.from(Array(20)).map((_, i) => (
          <stop
            key={i}
            offset={`${(i / 20) * 100}%`}
            stopColor={interpolatePiYG(1 - i / 20)}
          />
        ))}
      </linearGradient>
    );

    const legend = (
      <rect
        x={cellWidth + PADDING}
        y={cellHeight * 26}
        rx={2}
        ry={2}
        width={cellWidth * 7 - PADDING}
        height={cellHeight / 2}
        fill="url(#legend-gradient)"
      />
    );

    const textAttributes = {
      x: 0,
      y: cellHeight * 26 + cellHeight,
      fontSize: 12,
      alignmentBaseline: 'middle',
    };

    const labels = (
      <g>
        <text {...textAttributes} x={cellWidth}>
          {min.toFixed(3)}
        </text>
        <text {...textAttributes} x={cellWidth * 4.5}>
          {((min + max) / 2).toFixed(3)}
        </text>
        <text {...textAttributes} x={cellWidth * 8} textAnchor="end">
          {max.toFixed(3)}
        </text>
      </g>
    );

    return (
      <g>
        {legendGradient}
        {legend}
        {labels}
      </g>
    );
  };

  _renderCells = () => {
    const {data, cellWidth, cellHeight} = this.props;
    const hasData = data && data.length > 0;

    const cells = data.map(d => {
      const key = `${d.day}-${d.hour}`;
      return (
        <rect
          key={key}
          x={cellWidth * (d.day + 1) + PADDING}
          y={cellHeight * (d.hour + 1) + PADDING}
          width={cellWidth - PADDING * 2}
          height={cellHeight - PADDING * 2}
          fill={hasData ? `url(#${key}-gradient)` : '#DDD'}
          rx={2}
          ry={2}
        />
      );
    });

    return <g>{cells}</g>;
  };

  _generateGradients = () => {
    const {
      data,
      valueRange: [min, max],
    } = this.props;

    if (!data || data.length === 0) {
      return null;
    }

    const colorScale = scaleLinear()
      .domain([min, max])
      .range([0, 1.0]);

    const gradients = data.map(({day, hour, distribution}) => {
      const stops = distribution.map(({stop, value}, i) => (
        <stop
          key={i}
          offset={`${stop}%`}
          stopColor={interpolatePiYG(1 - colorScale(value))}
          stopOpacity={1}
        />
      ));

      const key = `${day}-${hour}`;
      return (
        <linearGradient key={key} id={`${key}-gradient`}>
          {stops}
        </linearGradient>
      );
    });

    return <defs>{gradients}</defs>;
  };

  render() {
    const {width, height} = this.props;
    if (width <= 0 || height <= 0) {
      return null;
    }

    return (
      <svg width={width} height={height}>
        {this._generateGradients()}
        {this._renderCells()}
        {this._renderColumnLabels()}
        {this._renderRowLabels()}
        {this._renderLegend()}
      </svg>
    );
  }
}
