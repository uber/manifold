import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {console} from 'global';
import Manifold from './manifold';

class Container extends PureComponent {
  static propTypes = {
    statePath: PropTypes.string,
  };

  static defaultProps = {
    statePath: 'manifold',
  };

  recomputations = 0;

  getSelector = getManifoldState => {
    this.recomputations++;
    if (this.recomputations > 1) {
      console.warn(
        'Manifold is caused to rerender. For better performance, avoid instantiate a new function as props'
      );
    }
    return allState => {
      const manifoldState = getManifoldState(allState);
      if (!manifoldState) {
        /* eslint-disable no-console */
        console.error(
          'Manifold root component is not mounted to the correct address in app reducer.'
        );
        /* eslint-enable no-console */
        return null;
      }
      return manifoldState;
    };
  };

  render() {
    const {getState, ...otherProps} = this.props;
    const selector = this.getSelector(getState);

    if (!selector) {
      // instance state hasn't been mounted yet
      return <div />;
    }

    return <Manifold {...otherProps} selector={selector} />;
  }
}

export default Container;
