import React, {Component} from 'react';
import {connect} from 'react-redux';

import MultiLineChart from '../../components/multi-line-chart';
import {
  getChartWidth,
  getChartHeight,
} from '../../selectors/multi-line-chart-selectors';
import {getColumnDataFactory} from '../../selectors/factories';

const mapStateToProps = (state, props) => {
  const {index} = props;
  const getColumnData = getColumnDataFactory(index);
  return {
    width: getChartWidth(state),
    height: getChartHeight(state),
    data: getColumnData(state),
  };
};

const mapDispatchToProps = {};

class Chart extends Component {
  render() {
    return <MultiLineChart {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
