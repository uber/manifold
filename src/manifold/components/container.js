import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {console} from 'global';
import {connect} from 'react-redux';
import Manifold from './manifold';

const mapStateToProps = (state, props) => ({state, ...props});

class Container extends PureComponent {
  static propTypes = {
    getState: PropTypes.func,
  };

  static defaultProps = {
    getState: state => state.manifold,
  };

  getSelector = getState => state => {
    if (!getState(state)) {
      /* eslint-disable no-console */
      console.error(
        'Manifold root component is not mounted to the correct address in app reducer.'
      );
      /* eslint-enable no-console */
      return null;
    }
    return getState(state);
  };

  render() {
    const {getState, state, ...otherProps} = this.props;
    const selector = this.getSelector(getState);

    if (!selector || !selector(state)) {
      // instance state hasn't been mounted yet
      return <div />;
    }

    return <Manifold {...otherProps} selector={selector} />;
  }
}

export default connect(mapStateToProps)(Container);
