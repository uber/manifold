import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  getContainerWidth,
  getContainerHeight,
  getColumnWidth,
  getColumnHeight,
  getData,
} from '../selectors';
import {updateData} from '../actions';
import MultiLineChart from '../components/multi-line-chart';

const mapStateToProps = (state, props) => ({
  containerWidth: getContainerWidth(state),
  containerHeight: getContainerHeight(state),
  columnWidth: getColumnWidth(state),
  columnHeight: getColumnHeight(state),
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
    const {data} = this.props;
    if (!data) return null;
    const {columnWidth, columnHeight} = this.props;
    return data.map(d => {
      return (
        <div style={this.columnStyle}>
          <MultiLineChart
            data={d}
            width={columnWidth - 20}
            height={(columnHeight - 30) / 2}
          />
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
