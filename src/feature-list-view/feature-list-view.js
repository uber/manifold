import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import FeatureView from './feature-view';
import {COLOR} from 'packages/mlvis-common/constants';

import {ITEM_HEIGHT} from './constants';

export default class FeatureListView extends PureComponent {
  static defaultProps = {
    data: [],
    selectedInstances: [],
    colors: [COLOR.GREEN, COLOR.PURPLE],
  };

  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    colors: PropTypes.arrayOf(PropTypes.string),
    selectedInstances: PropTypes.arrayOf(PropTypes.object),
  };

  _renderFeatureList = width => {
    const {data, selectedInstances, colors} = this.props;
    if (!data || data.length === 0) {
      return null;
    }

    const featureList = data.map((feature, i) => {
      const layout = {
        x: 0,
        y: ITEM_HEIGHT * i,
        width,
        height: ITEM_HEIGHT,
      };
      return (
        <FeatureView
          key={i}
          id={`${feature.name}`}
          data={feature}
          colors={colors}
          selectedInstances={selectedInstances}
          {...layout}
        />
      );
    });

    return (
      <svg
        width={width}
        height={ITEM_HEIGHT * data.length}
        pointerEvents="none"
      >
        {featureList}
      </svg>
    );
  };

  render() {
    const {width} = this.props;
    return <React.Fragment>{this._renderFeatureList(width)}</React.Fragment>;
  }
}
