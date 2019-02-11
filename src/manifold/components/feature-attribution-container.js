// @noflow
import React, {PureComponent} from 'react';
import {connect} from '../custom-connect';
import {Row, Col} from 'antd';

import {updateDivergenceThreshold, exportFeatureEncoder} from '../actions';
import {getDivergenceThreshold} from '../selectors/base';
import {getFeatures} from '../selectors/adaptors';
import FeatureListView from '@uber/feature-list-view';

const PADDING = 15;

const mapDispatchToProps = {updateDivergenceThreshold, exportFeatureEncoder};
const mapStateToProps = (state, props) => {
  return {
    features: getFeatures(state),
    divergenceThreshold: getDivergenceThreshold(state),
  };
};

class FeatureAttributionContainer extends PureComponent {
  static defaultProps = {
    height: 700,
    width: 500,
    features: [],
    padding: PADDING,
  };

  get style() {
    const {height, padding} = this.props;
    return {
      root: {
        overflow: 'scroll',
        height,
        padding,
      },
    };
  }

  _renderFeatureListView = () => {
    const {features, width, padding} = this.props;
    if (!features || features.length === 0) {
      return null;
    }
    return <FeatureListView features={features} width={width - 2 * padding} />;
  };

  render() {
    return (
      <Row style={this.style.root}>
        <Col span={24}>{this._renderFeatureListView()}</Col>
      </Row>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureAttributionContainer);
