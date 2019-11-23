import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  getColumnDataFactory,
  getSliderValueFactory,
} from '../../selectors/factories';

const mapStateToProps = (state, props) => {
  const {index} = props;
  const getColumnData = getColumnDataFactory(index);
  const getSliderValue = getSliderValueFactory(index);
  return {
    data: getColumnData(state),
    sliderValue: getSliderValue(state),
  };
};

const mapDispatchToProps = {};

class Chart extends Component {
  render() {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
