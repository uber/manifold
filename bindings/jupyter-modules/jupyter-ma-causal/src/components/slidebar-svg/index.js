import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Slidebar from '../slidebar';

export default class Chart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    extent: PropTypes.array.isRequired,
    renderLeftLabel: PropTypes.bool,
    renderRightLabel: PropTypes.bool,
    leftLabel: PropTypes.string,
    rightLabel: PropTypes.string,
    x: PropTypes.number,
    onDragStart: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    style: PropTypes.object,
    disableDrag: PropTypes.bool,
  };

  static defaultProps = {
    extent: [[0, 0], [1, 1]],
    onDragStart: () => {},
    onDrag: () => {},
    onDragEnd: () => {},
  };

  render() {
    const {width, height, style, ...rest} = this.props;
    return (
      <svg
        ref={input => (this.svg = input)}
        width={width}
        height={height}
        style={style}
      >
        <Slidebar
          {...rest}
          getEventMouse={event => {
            const {clientX, clientY} = event;
            const {left, top} = this.svg.getBoundingClientRect();
            return [clientX - left, clientY - top];
          }}
        />
      </svg>
    );
  }
}
