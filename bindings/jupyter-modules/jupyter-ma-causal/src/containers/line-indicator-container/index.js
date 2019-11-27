import React, {Component} from 'react';
import {connect} from 'react-redux';
import {scaleLinear} from 'd3-scale';

import {clamp} from '../../utils';

import {getSliderValueFactory} from '../../selectors/factories';
import {
  getChartWidth,
  getChartPadding,
} from '../../selectors/indicator-line-selectors';
import {updateSliderValues} from '../../actions';

const mapStateToProps = (state, props) => {
  const {index} = props;
  const getSliderValue = getSliderValueFactory(index);
  return {
    width: getChartWidth(state),
    padding: getChartPadding(state),
    sliderValue: getSliderValue(state),
  };
};

const mapDispatchToProps = {updateSliderValues};

class Chart extends Component {
  _getScale() {
    const {
      width,
      padding: {left, right},
    } = this.props;
    return scaleLinear()
      .domain([0, 1])
      .range([left, width - right]);
  }

  _getEventMouse = event => {
    const {clientX, clientY} = event;
    const {left, top} = this.div.parentNode.getBoundingClientRect();
    return [clientX - left, clientY - top];
  };

  render() {
    const {
      width,
      height,
      sliderValue,
      padding: {top, bottom, left, right},
      index,
    } = this.props;
    const scale = this._getScale();

    const x = scale(
      sliderValue === null || sliderValue === undefined ? 1 : sliderValue
    );

    return (
      <div
        ref={input => (this.div = input)}
        style={{
          position: 'absolute',
          left: x,
          top,
          width: 1,
          height: `calc(100% - ${bottom}px)`,
          borderLeft: '1px dotted black',
          cursor: 'ew-resize',
        }}
        onPointerDown={event => {
          event.target.setPointerCapture(event.pointerId);
          this.move = this._getEventMouse(event);
        }}
        onPointerMove={event => {
          if (this.move) {
            const [x, y] = this._getEventMouse(event);
            const [sx, sy] = this.move;
            const dx = x - sx;
            const mx = Math.min(Math.max(x + dx, left), width - right);
            this.move = [x, y];
            const value = clamp(scale.invert(mx));
            this.props.updateSliderValues({[index]: value});
          }
        }}
        onPointerUp={event => {
          this.move = null;
        }}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
