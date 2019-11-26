import React, {Component} from 'react';
import {connect} from 'react-redux';
import {scaleLinear} from 'd3-scale';

import Slidebar from '../../components/slidebar-svg';
import {clamp} from '../../utils';

import {
  getColumnDataFactory,
  getSliderValueFactory,
} from '../../selectors/factories';
import {
  getChartWidth,
  getChartHeight,
} from '../../selectors/slidebar-selectors';
import {updateSliderValues} from '../../actions';

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

const mapDispatchToProps = {updateSliderValues};

class Chart extends Component {
  getScale() {
    const {width} = this.props;
    return scaleLinear()
      .domain([0, 1])
      .range([0, width]);
  }
  render() {
    const {width, height, sliderValue, index} = this.props;
    const scale = this.getScale();
    return (
      <Slidebar
        width={width}
        height={height}
        extent={[[0, 0], [width, height]]}
        x={sliderValue === undefined ? null : scale(sliderValue)}
        onDrag={({x}) => {
          const value = clamp(scale.invert(x));
          this.props.updateSliderValues({[index]: value});
        }}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
