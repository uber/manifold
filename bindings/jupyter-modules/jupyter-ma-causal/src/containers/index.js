import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  getContainerWidth,
  getContainerHeight,
  getColumnWidth,
  getColumnHeight,
  getData,
} from '../selectors/base-selectors';
import {updateData} from '../actions';
import MultiLineChartContainer from '../containers/multi-line-chart-container';

const mapStateToProps = (state, props) => ({
  containerWidth: getContainerWidth(state),
  containerHeight: getContainerHeight(state),
  columnWidth: getColumnWidth(state),
  columnHeight: getColumnHeight(state),
  data: getData(state),
  params: props,
});

const mapDispatchToProps = {updateData};

class App extends Component {
  get containerStyle() {
    const {containerWidth, containerHeight} = this.props;
    return {
      width: containerWidth,
      height: containerHeight,
      display: 'flex',
    };
  }
  get columnStyle() {
    const {columnWidth, columnHeight} = this.props;
    return {
      width: columnWidth,
      height: columnHeight,
    };
  }
  componentDidMount() {
    const {data} = this.props.params;
    this.props.updateData(data);
  }
  _renderColumns() {
    const {data, columnWidth, columnHeight} = this.props;
    return data.map((d, i) => {
      return (
        <div key={i} style={this.columnStyle}>
          <MultiLineChartContainer index={i} />
        </div>
      );
    });
  }
  render() {
    return <div style={this.containerStyle}>{this._renderColumns()}</div>;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
