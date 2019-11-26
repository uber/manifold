import React, {Component} from 'react';
import {connect} from 'react-redux';
import {scaleLinear} from 'd3-scale';
import {format as d3Format} from 'd3-format';

import Slidebar from '../../components/slidebar-svg';
import {clamp} from '../../utils';

import {
  getLineDataFactory,
  getSliderValueFactory,
} from '../../selectors/factories';
import {
  getChartWidth,
  getChartHeight,
} from '../../selectors/slidebar-selectors';
import {updateSliderValues} from '../../actions';

const mapStateToProps = (state, props) => {
  const {index, lineName} = props;
  const getLineData = getLineDataFactory(index, lineName);
  const getSliderValue = getSliderValueFactory(index);
  return {
    data: getLineData(state),
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
  getLeftLabel() {
    const {sliderValue, data, lineName} = this.props;
    if (sliderValue === null || sliderValue === undefined) {
      return '1.0';
    }

    const format = d3Format('.6f');
    const idx = data.findIndex(d => d.x > sliderValue);
    if (idx === -1) {
      return format(data[data.length - 1].y);
    } else {
      return format(data[idx && idx - 1].y);
    }
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
        renderLeftLabel
        leftLabel={this.getLeftLabel()}
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
