import React, {Component} from 'react';
import {connect} from 'react-redux';
import {format as d3Format} from 'd3-format';

import {
  getLineDataFactory,
  getLineDataYDomainFactory,
} from '../../selectors/factories';

import {
  getChartWidth,
  getChartHeight,
  getChartPadding,
} from '../../selectors/staticbar-selectors';

const mapStateToProps = (state, props) => {
  const {index, lineName} = props;
  // lineName: the name of the line representing the uplifting effect
  const getLineData = getLineDataFactory(index, lineName);
  const getLineDataYDomain = getLineDataYDomainFactory(getLineData);
  return {
    data: getLineData(state),
    domain: getLineDataYDomain(state),
    width: getChartWidth(state),
    height: getChartHeight(state),
    padding: getChartPadding(state),
  };
};

const mapDispatchToProps = {};

class Chart extends Component {
  render() {
    const {
      data,
      width,
      height,
      padding: {left, right, top, bottom},
      groupName, // treatment or control
      domain,
    } = this.props;

    const format = d3Format('.2f');

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
            ? data.length
              ? format(domain[0])
              : null
            : data.length
              ? format(domain[1])
              : null}
        </text>
      </svg>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
