import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Chart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    ticks: PropTypes.array.isRequired,
    values: PropTypes.array.isRequired,
    value: PropTypes.number,
  };

  static getDerivedStateFromProps = (props, state) => ({
    ...state,
    value: props.value === undefined ? props.value : state.value,
  });

  _renderBorder() {}
  _renderLeftBar() {}
  _renderRightBar() {}
  render() {
    return null;
  }
}
