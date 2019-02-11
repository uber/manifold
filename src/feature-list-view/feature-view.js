// @noflow
import React, {PureComponent} from 'react';
import CategoricalFeatureView from './categorical-feature-view';
import NumericalFeatureView from './numerical-feature-view';
import {withDerivedData} from './utils';
import {FEATURE_TYPE} from '@uber/mlvis-common/constants';

// generic component for rendering features with unknown types
class FeatureView extends PureComponent {
  render() {
    const {
      feature: {type},
    } = this.props;
    switch (type) {
      case FEATURE_TYPE.CATEGORICAL:
        return <CategoricalFeatureView {...this.props} />;
      case FEATURE_TYPE.NUMERICAL:
        return <NumericalFeatureView {...this.props} />;
      case undefined:
        return <div />;
      default:
        return;
    }
  }
}

export default withDerivedData(FeatureView);
