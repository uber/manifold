import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {line as d3Line} from 'd3-shape';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';
import {extent as d3Extent} from 'd3-array';
import {format as d3Format} from 'd3-format';

const PADDING = {TOP: 10, BOTTOM: 20, LEFT: 20, RIGHT: 10};

const getXScale = width =>
  scaleLinear()
    .domain([0, 1])
    .range([PADDING.LEFT, width - PADDING.RIGHT]);

const getYScale = height =>
  scaleLinear()
    .domain([0, 1])
    .range([height - PADDING.BOTTOM, PADDING.TOP]);

const colorScale = scaleOrdinal(schemeCategory10);

export default class Chart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

  _renderLegends() {
    const {width, height} = this.props;
  }
  _renderXAxies() {
    const {width, height} = this.props;
    const xScale = getXScale(width);
    const format = d3Format('.1f');

    return (
      <React.Fragment>
        <line
          x1={PADDING.LEFT}
          y1={height - PADDING.BOTTOM}
          x2={width - PADDING.RIGHT}
          y2={height - PADDING.BOTTOM}
          stroke="black"
          strokeWidth={1}
        />
        {xScale.ticks(10).map(t => {
          const x = xScale(t);
          return (
            <React.Fragment key={t.toString()}>
              <line
                x1={x}
                y1={height - PADDING.BOTTOM}
                x2={x}
                y2={height - PADDING.BOTTOM + 4}
                stroke="black"
                strokeWidth={1}
              />
              <text
                x={x}
                y={height - PADDING.BOTTOM + 6}
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
    const {height} = this.props;
    const yScale = getYScale(height);
    const format = d3Format('.1f');

    return (
      <React.Fragment>
        <line
          x1={PADDING.LEFT}
          y1={height - PADDING.BOTTOM}
          x2={PADDING.LEFT}
          y2={PADDING.TOP}
          stroke="black"
          strokeWidth={1}
        />
        {yScale.ticks(10).map(t => {
          const y = yScale(t);
          return (
            <React.Fragment key={t.toString()}>
              <line
                x1={PADDING.LEFT}
                y1={y}
                x2={PADDING.LEFT - 4}
                y2={y}
                stroke="black"
                strokeWidth={1}
              />
              <text
                x={PADDING.LEFT - 6}
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
    const {width, height} = this.props;
    const xScale = getXScale(width);
    const yScale = getYScale(height);
    return (
      <React.Fragment>
        {yScale.ticks(10).map(t => {
          const y = yScale(t);
          return (
            <line
              key={`y-${t}`}
              x1={PADDING.LEFT}
              y1={y}
              x2={width - PADDING.RIGHT}
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
              y1={PADDING.TOP}
              x2={x}
              y2={height - PADDING.TOP}
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
    const xScale = getXScale(width);
    const yScale = getYScale(height);

    return data.lines.map(({name, line}, idx) => {
      const getSVGLine = d3Line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
      return (
        <path
          key={name}
          d={getSVGLine(line)}
          fill="none"
          stroke={colorScale(idx)}
          strokeWidth={2}
        />
      );
    });
  }

  render() {
    const {width, height} = this.props;
    return (
      <svg width={width} height={height}>
        {this._renderGrids()}
        {this._renderLines()}
        {this._renderXAxies()}
        {this._renderYAxis()}
      </svg>
    );
  }
}
