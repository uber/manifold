import React, {Component} from 'react';
import {connect} from 'react-redux';

import LineChart from '../../components/line-chart';
import {
  getChartWidth,
  getChartHeight,
  getChartPadding,
} from '../../selectors/multi-line-chart-selectors';
import {
  getLineDataFactory,
  getLineDataYDomainFactory,
} from '../../selectors/factories';

const mapStateToProps = (state, props) => {
  const {index, name} = props;
  const getLineData = getLineDataFactory(index, name);
  const getLineDataYDomain = getLineDataYDomainFactory(getLineData);
  return {
    width: getChartWidth(state),
    height: getChartHeight(state),
    data: getLineData(state),
    domain: getLineDataYDomain(state),
    padding: getChartPadding(state),
  };
};

const mapDispatchToProps = {};

class Chart extends Component {
  render() {
    return <LineChart {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
