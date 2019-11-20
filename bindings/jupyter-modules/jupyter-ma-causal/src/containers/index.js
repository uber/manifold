import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getContainerWidth, getContainerHeight, getData} from '../selectors';
import {updateData} from '../actions';

const mapStateToProps = (state, props) => ({
  propData: props.data,
  containerWidth: getContainerWidth(state),
  containerHeight: getContainerHeight(state),
  data: getData(state),
});

const mapDispatchToProps = {updateData};

class App extends Component {
  componentDidMount() {
    const {propData} = this.props;
    this.props.updateData(propData);
  }
  render() {
    const {containerWidth, containerHeight} = this.props;
    const {data} = this.props;
    return <div style={{width: containerWidth, height: containerHeight}} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
