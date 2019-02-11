// @noflow
import React, {PureComponent} from 'react';
import ContainerDimensions from 'react-container-dimensions';
import FeatureView from './feature-view';

const ITEM_HEIGHT = 64;
const HEADER_HEIGHT = 16;
const FOOTER_HEIGHT = 16;
const LEFT_SIDER_WIDTH = 16;
const RIGHT_SIDER_WIDTH = 16;

export default class FeatureListView extends PureComponent {
  static defaultProps = {
    width: 0,
    height: 0,
    features: [],
  };

  _renderFeatureList = width => {
    const {features} = this.props;
    if (!features || features.length === 0) {
      return null;
    }

    const featureList = features.map((feature, i) => {
      const layout = {
        x: 0,
        y: ITEM_HEIGHT * i,
        width: width - LEFT_SIDER_WIDTH - RIGHT_SIDER_WIDTH,
        height: ITEM_HEIGHT,
      };
      return (
        <FeatureView
          key={i}
          id={`${feature.name}`}
          feature={feature}
          {...layout}
        />
      );
    });

    return (
      <svg
        x={LEFT_SIDER_WIDTH}
        y={HEADER_HEIGHT}
        width={width}
        height={ITEM_HEIGHT * features.length + HEADER_HEIGHT + FOOTER_HEIGHT}
        pointerEvents="none"
      >
        {featureList}
      </svg>
    );
  };

  render() {
    return (
      <ContainerDimensions>
        {({width, height}) => this._renderFeatureList(width, height)}
      </ContainerDimensions>
    );
  }
}
