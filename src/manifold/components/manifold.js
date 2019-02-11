// @noflow
import React, {PureComponent} from 'react';
import {connect} from '../custom-connect';
import {Layout, Row, Col} from 'antd';
import ContainerDimensions from 'react-container-dimensions';

import MultiComparisonControlContainer from './multi-comparison-control-container';
import FeaturesControlContainer from './features-control-container';
import FiltersContainer from './filters-container';
import MultiModelComparisonContainer from './multi-model-comparison-container';
import FeatureAttributionContainer from './feature-attribution-container';

const mapDispatchToProps = (dispatch, props) => ({
  dispatch,
});

const mapStateToProps = (state, props) => {
  const {dispatch, selector, ...otherProps} = props;
  return {
    ...otherProps,
  };
};

const COMPARISON_CHART_WIDTH_RATIO = 0.38;
const ATTRIBUTION_CHART_WIDTH_RATIO = 0.3;
const CHART_HEIGHT_RATIO = 0.75;

class Manifold extends PureComponent {
  get style() {
    return {
      root: {
        fontFamily: 'ff-clan-web-pro, "Helvetica Neue", Helvetica, sans-serif',
        fontSize: '12px',
        display: 'flex',
        background: '#fff',
        height: '100%',
      },
      section: {
        display: 'flex',
        flexDirection: 'column',
      },
    };
  }

  render() {
    const {selector} = this.props;
    return (
      <ContainerDimensions>
        {({width, height}) => (
          <Layout style={this.style.root}>
            <Row style={this.style.content}>
              <Col span={16} style={this.style.section}>
                <Row>
                  <MultiComparisonControlContainer selector={selector} />
                </Row>
                <Row>
                  <Col span={6}>
                    <FiltersContainer selector={selector} />
                  </Col>
                  <Col span={18}>
                    <MultiModelComparisonContainer
                      selector={selector}
                      width={width * COMPARISON_CHART_WIDTH_RATIO}
                      height={height * CHART_HEIGHT_RATIO}
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={8} style={this.style.section}>
                <FeaturesControlContainer selector={selector} />
                <FeatureAttributionContainer
                  selector={selector}
                  width={width * ATTRIBUTION_CHART_WIDTH_RATIO}
                  height={height * CHART_HEIGHT_RATIO}
                />
              </Col>
            </Row>
          </Layout>
        )}
      </ContainerDimensions>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Manifold);
