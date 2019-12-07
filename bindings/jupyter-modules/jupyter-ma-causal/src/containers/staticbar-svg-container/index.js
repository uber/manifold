import React, {Component} from 'react';
import {connect} from 'react-redux';
import {format as d3Format} from 'd3-format';

import {getLineDataFactory} from '../../selectors/factories';

import {
  getChartWidth,
  getChartHeight,
  getChartPadding,
} from '../../selectors/staticbar-selectors';

const mapStateToProps = (state, props) => {
  const {index, lineName} = props;
  const getLineData = getLineDataFactory(index, lineName);
  return {
    data: getLineData(state),
    width: getChartWidth(state),
    height: getChartHeight(state),
    padding: getChartPadding(state),
  };
};

const mapDispatchToProps = {};

class Chart extends Component {
  render() {
    const {
      width,
      height,
      padding: {left, right, top, bottom},
      groupName, // treatment or control
      data,
    } = this.props;

    const format = d3Format('.6f');

    return (
      <svg width={width} height={height}>
        <rect
          x={left}
          y={0}
          width={width - right - left}
          height={height}
          fill={groupName === 'treatment' ? '#3399ff' : '#c2c2d6'}
        />
        <text
          x={width - right - 3}
          y={(top + height - bottom) / 2}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {groupName === 'treatment'
            ? format(data[data.length - 1].y)
            : format(data[0].y)}
        </text>
      </svg>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
