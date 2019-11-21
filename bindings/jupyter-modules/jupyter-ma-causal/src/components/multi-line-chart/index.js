import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {line as d3Line} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import {extent as d3Extent} from 'd3-array';

const PADDING = {TOP: 10, BOTTOM: 10, LEFT: 10, RIGHT: 10};

const getXScale = width =>
  scaleLinear()
    .domain([0, 1])
    .range([PADDING.LEFT, width - PADDING.RIGHT]);
const getYScale = height =>
  scaleLinear()
    .domain([0, 1])
    .range([height - PADDING.BOTTOM, PADDING.TOP]);

export default class Chart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

  _renderLegends() {}
  _renderAxies() {}
  _renderGrids() {}
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
          stroke="black"
          strokeWidth={1}
        />
      );
    });
  }

  render() {
    const {width, height} = this.props;
    return (
      <svg width={width} height={height}>
        {this._renderLines()}
      </svg>
    );
  }
}
