import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {line as d3Line} from 'd3-shape';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';
import {extent as d3Extent} from 'd3-array';
import {format as d3Format} from 'd3-format';

const colorScale = scaleOrdinal(schemeCategory10);

export default class Chart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.exact({
      top: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number,
      right: PropTypes.number,
    }).isRequired,
  };

  _getXScale = () => {
    const {
      width,
      padding: {left, right},
    } = this.props;
    return scaleLinear()
      .domain([0, 1])
      .range([left, width - right]);
  };

  _getYScale = () => {
    const {
      height,
      padding: {top, bottom},
    } = this.props;
    return scaleLinear()
      .domain([0, 1])
      .range([height - bottom, top]);
  };

  _renderLegends() {
    const {
      data,
      width,
      height,
      padding: {left, right, top},
    } = this.props;
    if (!data || !data.lines) {
      return null;
    }
    return data.lines.map((d, i) => (
      <React.Fragment key={i}>
        <text
          x={width - right - 23}
          y={top + 5 + 15 * i}
          dominantBaseline="middle"
          textAnchor="end"
          fontSize={10}
        >
          {d.name}
        </text>
        <line
          x1={width - right - 20}
          y1={top + 5 + 15 * i}
          x2={width - right - 5}
          y2={top + 5 + 15 * i}
          stroke={colorScale(i)}
          strokeWidth={2}
        />
      </React.Fragment>
    ));
  }
  _renderXAxies() {
    const {
      width,
      height,
      padding: {bottom, left, right},
    } = this.props;
    const xScale = this._getXScale();
    const format = d3Format('.1f');

    return (
      <React.Fragment>
        <line
          x1={left}
          y1={height - bottom}
          x2={width - right}
          y2={height - bottom}
          stroke="black"
          strokeWidth={1}
        />
        {xScale.ticks(10).map(t => {
          const x = xScale(t);
          return (
            <React.Fragment key={t}>
              <line
                x1={x}
                y1={height - bottom}
                x2={x}
                y2={height - bottom + 4}
                stroke="black"
                strokeWidth={1}
              />
              <text
                x={x}
                y={height - bottom + 6}
                dominantBaseline="hanging"
                textAnchor="middle"
                fontSize={10}
              >
                {format(t)}
              </text>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
  _renderYAxis() {
    const {
      height,
      padding: {bottom, left, top},
    } = this.props;
    const yScale = this._getYScale();
    const format = d3Format('.1f');

    return (
      <React.Fragment>
        <line
          x1={left}
          y1={height - bottom}
          x2={left}
          y2={top}
          stroke="black"
          strokeWidth={1}
        />
        {yScale.ticks(10).map(t => {
          const y = yScale(t);
          return (
            <React.Fragment key={t}>
              <line
                x1={left}
                y1={y}
                x2={left - 4}
                y2={y}
                stroke="black"
                strokeWidth={1}
              />
              <text
                x={left - 6}
                y={y}
                dominantBaseline="middle"
                textAnchor="end"
                fontSize={10}
              >
                {format(t)}
              </text>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
  _renderGrids() {
    const {
      width,
      height,
      padding: {left, right, top},
    } = this.props;
    const xScale = this._getXScale();
    const yScale = this._getYScale();
    return (
      <React.Fragment>
        {yScale.ticks(10).map(t => {
          const y = yScale(t);
          return (
            <line
              key={`y-${t}`}
              x1={left}
              y1={y}
              x2={width - right}
              y2={y}
              stroke="lightgray"
              strokeWidth={1}
            />
          );
        })}
        {xScale.ticks(10).map(t => {
          const x = xScale(t);
          return (
            <line
              key={`x-${t}`}
              x1={x}
              y1={top}
              x2={x}
              y2={height - top}
              stroke="lightgray"
              strokeWidth={1}
            />
          );
        })}
      </React.Fragment>
    );
  }
  _renderLines() {
    const {data} = this.props;
    if (!data || !data.lines) {
      return null;
    }

    const {width, height} = this.props;
    const xScale = this._getXScale();
    const yScale = this._getYScale();

    return data.lines.map(({name, line}, index) => {
      const getSVGLine = d3Line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
      return (
        <path
          key={name}
          d={getSVGLine(line)}
          fill="none"
          stroke={colorScale(index)}
          strokeWidth={2}
        />
      );
    });
  }
  _renderDots() {
    const {data} = this.props;
    if (!data || !data.lines) {
      return null;
    }
    const {width, height} = this.props;
    const xScale = this._getXScale();
    const yScale = this._getYScale();

    return data.lines.map(({name, line}, index) => {
      return (
        <g key={name}>
          {line.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={3}
              fill={colorScale(index)}
            />
          ))}
        </g>
      );
    });
  }
  render() {
    const {width, height} = this.props;
    return (
      <svg width={width} height={height}>
        {this._renderGrids()}
        {this._renderLines()}
        {this._renderDots()}
        {this._renderXAxies()}
        {this._renderYAxis()}
        {this._renderLegends()}
      </svg>
    );
  }
}
