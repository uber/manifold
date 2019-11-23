import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Slidebar from '../slidebar';

export default class Chart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    extent: PropTypes.array.isRequired,
    x: PropTypes.number,
    getEventMouse: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
  };

  static defaultProps = {
    extent: [[0, 0], [1, 1]],
    getEventMouse: event => [event.clientX, event.clientY],
    onDragStart: () => {},
    onDrag: () => {},
    onDragEnd: () => {},
  };

  render() {
    const {width, height, style, ...rest} = this.props;
    return (
      <svg width={width} height={height} style={style}>
        <Slidebar {...rest} />;
      </svg>
    );
  }
}
