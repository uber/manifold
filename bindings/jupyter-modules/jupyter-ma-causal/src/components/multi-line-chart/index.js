import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Chart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  };
  static defaultProps = {};
  render() {}
}
