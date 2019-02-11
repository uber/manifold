// @noflow
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import Manifold from './manifold';

const mapStateToProps = (state, props) => ({state, ...props});
const mapDispatchToProps = dispatch => ({dispatch});

class Container extends PureComponent {
  static defaultProps = {
    getState: state => state.manifold,
  };

  getSelector = getState => state => {
    if (!getState(state)) {
      /*eslint-disable no-console */
      console.error('noState');
      /*eslint-enable no-console */
      return null;
    }
    return getState(state);
  };

  render() {
    const {getState, dispatch, state, ...otherProps} = this.props;
    const selector = this.getSelector(getState);

    if (!selector || !selector(state)) {
      // instance state hasn't been mounted yet
      return <div />;
    }

    return <Manifold {...otherProps} selector={selector} dispatch={dispatch} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);
