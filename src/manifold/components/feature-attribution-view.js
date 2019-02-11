// @noflow
import React, {PureComponent} from 'react';
import styled from 'styled-components';

import {Select, Button, Row, Col, Slider} from 'antd';
import FeatureListView from '@uber/feature-list-view';

const FEATURE_RANKING_METRICS = {
  KL_DIVERGENCE: 'KL-Divergence',
  BHATTACHARYYA: 'Bhattacharyya',
  SHAP: 'Shap',
};

const RootContainer = styled(Row)`
  padding: 12px;
`;

const FlexBox = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

export default class FeatureAttributionView extends PureComponent {
  static defaultProps = {
    features: [],
    rankingMetric: FEATURE_RANKING_METRICS.KL_DIVERGENCE,
    // TODO the segmentGroups is used in Ellie's design, but not in the current implementation
    segmentGroups: [[0], [1]],
    exportFeatureEncoder: () => {},
    updateDivergenceThreshold: () => {},
  };

  state = {
    // TODO filter features based on divergence score inside this component
    filteredFeatures: [],
  };

  _exportFeatureEncoder = () => {
    this.props.exportFeatureEncoder(this.props.featureEncoders);
  };

  _renderControls = () => {
    return (
      <Row>
        <Col span={20}>
          <FlexBox>
            <Label>Difference metric:</Label>
            <Select
              defaultValue="kl-divergence"
              size="small"
              onChange={() => {}}
            >
              <Select.Option value="kl-divergence">KL-Divergence</Select.Option>
              <Select.Option value="bhattacharyya" disabled={true}>
                Bhattacharyya
              </Select.Option>
              <Select.Option value="shap" disabled={true}>
                Shap
              </Select.Option>
            </Select>
          </FlexBox>
          <FlexBox>
            <Label>Difference filter:</Label>
            <Slider
              style={{marginTop: '12px', width: '120px'}}
              min={0}
              max={1}
              step={0.01}
              defaultValue={0.2}
              onChange={this.props.updateDivergenceThreshold}
            />
          </FlexBox>
        </Col>
        <Col span={4}>
          <Button
            size="small"
            value="export"
            onClick={this._exportFeatureEncoder}
          >
            Export
          </Button>
        </Col>
      </Row>
    );
  };

  _renderFeatureList = () => {
    const {features} = this.props;
    if (!features || features.length === 0) {
      return null;
    }

    return <FeatureListView features={features} />;
  };

  render() {
    return (
      <RootContainer id="feature-attribution-view">
        <Label>Feature Attribution</Label>
        {this._renderControls()}
        {this._renderFeatureList()}
      </RootContainer>
    );
  }
}
