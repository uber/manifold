import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {line as d3Line} from 'd3-shape';
import {scaleLinear} from 'd3-scale';

export default class Chart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  };
  static defaultProps = {};

  _renderAxies() {}
  _renderGrids() {}
  _renderLines() {
    const {data} = this.props;
    if (!data || !data.lines) {
      return null;
    }
    const {lines} = data;
  }
  render() {
    return <svg />;
  }
}
