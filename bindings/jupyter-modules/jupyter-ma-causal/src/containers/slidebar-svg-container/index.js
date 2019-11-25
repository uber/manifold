import React, {Component} from 'react';
import {connect} from 'react-redux';
import {scaleLinear} from 'd3-scale';

import Slidebar from '../../components/slidebar-svg';

import {
  getColumnDataFactory,
  getSliderValueFactory,
} from '../../selectors/factories';
import {
  getChartWidth,
  getChartHeight,
} from '../../selectors/slidebar-selectors';

const mapStateToProps = (state, props) => {
  const {index} = props;
  const getColumnData = getColumnDataFactory(index);
  const getSliderValue = getSliderValueFactory(index);
  return {
    data: getColumnData(state),
    sliderValue: getSliderValue(state),
    width: getChartWidth(state),
    height: getChartHeight(state),
  };
};

const mapDispatchToProps = {};

class Chart extends Component {
  render() {
    const {width, height} = this.props;
    return (
      <Slidebar
        width={width}
        height={height}
        extent={[[0, 0], [width, height]]}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
