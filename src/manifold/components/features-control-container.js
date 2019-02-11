// @noflow
import React, {PureComponent} from 'react';
import {connect} from '../custom-connect';
import Headline from '@uber/mlvis-common-ui/headline';
import {Select, Row, Col, Slider} from 'antd';

import {updateDivergenceThreshold} from '../actions';
import {getDivergenceThreshold} from '../selectors/base';

const mapDispatchToProps = {
  updateDivergenceThreshold,
};
const mapStateToProps = (state, props) => ({
  divergenceThreshold: getDivergenceThreshold(state),
});

class FeaturesControlContainer extends PureComponent {
  get style() {
    return {
      root: {
        padding: 12,
      },
      flex: {
        display: 'flex',
        alignItems: 'center',
      },
      label: {
        fontSize: '13px',
        margin: '0 6px',
      },
    };
  }

  render() {
    return (
      <Row style={this.style.root}>
        <Headline
          title={'Features'}
          description={'Feature distributions by segment groups'}
          howTo={''}
        />
        <Row>
          <Col span={12}>
            <div style={this.style.label}> {`difference metric:`} </div>
            <Select
              defaultValue="kl-divergence"
              size="small"
              onChange={() => {}}
            >
              <Select.Option value="kl-divergence">
                {' '}
                KL-Divergence{' '}
              </Select.Option>
              <Select.Option value="bhattacharyya" disabled={true}>
                {' '}
                Bhattacharyya{' '}
              </Select.Option>
              <Select.Option value="shap" disabled={true}>
                {' '}
                Shap{' '}
              </Select.Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={this.style.label}> {`difference filter:`} </div>
            <Slider
              style={{marginTop: '12px', width: '120px'}}
              min={0}
              max={1}
              step={0.01}
              defaultValue={this.props.divergenceThreshold}
              onChange={this.props.updateDivergenceThreshold}
            />
          </Col>
        </Row>
      </Row>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturesControlContainer);
