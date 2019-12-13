import React, {Component} from 'react';
import {connect} from 'react-redux';

import LineChartContainer from '../line-chart-container';
import {getColumnDataFactory} from '../../selectors/factories';

const mapStateToProps = (state, props) => {
  const {index} = props;
  const getColumnData = getColumnDataFactory(index);
  return {
    data: getColumnData(state),
  };
};

const mapDispatchToProps = {};

class Chart extends Component {
  render() {
    const {index, data} = this.props;
    return (
      <React.Fragment>
        {data.lines.map(({name}) => (
          <div key={name}>
            <LineChartContainer index={index} name={name} />
          </div>
        ))}
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
