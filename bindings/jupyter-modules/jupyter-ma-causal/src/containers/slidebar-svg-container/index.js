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
  getChartPadding,
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
    padding: getChartPadding(state),
  };
};

const mapDispatchToProps = {updateSliderValues};

class Chart extends Component {
  getScale() {
    const {
      width,
      padding: {left, right},
    } = this.props;
    return scaleLinear()
      .domain([0, 1])
      .range([left, width - right]);
  }

  getLeftLabel() {
    const format = d3Format('.6f');
    const {sliderValue, data, lineName} = this.props;
    if (sliderValue === null || sliderValue === undefined) {
      return format(data[data.length - 1].y);
    }

    const idx = data.findIndex(d => d.x > sliderValue);
    if (idx === -1) {
      return format(data[data.length - 1].y);
    } else {
      return format(data[idx && idx - 1].y);
    }
  }

  render() {
    const {
      width,
      height,
      sliderValue,
      index,
      padding: {left, right},
    } = this.props;
    const scale = this.getScale();
    return (
      <Slidebar
        width={width}
        height={height}
        extent={[[left, 0], [width - right, height]]}
        x={sliderValue === undefined ? null : scale(sliderValue)}
        renderLeftLabel
        leftLabel={this.getLeftLabel()}
        disableDrag
        onDrag={({x}) => {
          // leave these code here in case the design requirement change and drag is needed again here
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
