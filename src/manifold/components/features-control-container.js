// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ContainerDimensions from 'react-container-dimensions';
import {connect} from '../custom-connect';
import {Control} from '@uber/mlvis-common/ui';
import {Select, Input, Slider} from 'antd';
import {CONTROL_MARGIN} from '../constants';

import {
  fetchFeatures,
  updateDivergenceThreshold,
  updateSegmentGroups,
} from '../actions';
import {
  getDivergenceThreshold,
  getFeatureDistributionParams,
} from '../selectors/base';
import {computeWidthLadder, isValidSegmentGroups} from '../utils';

const mapDispatchToProps = {
  fetchFeatures,
  updateSegmentGroups,
  updateDivergenceThreshold,
};
const mapStateToProps = (state, props) => ({
  divergenceThreshold: getDivergenceThreshold(state),
  featureDistributionParams: getFeatureDistributionParams(state),
});

const CONTROL_WIDTH = [320, 135, 100];
// remove some elements based on parent width
const WIDTH_LADDER = computeWidthLadder(CONTROL_WIDTH, CONTROL_MARGIN);

const StyledControl = styled(Control)`
  display: ${props => (props.isHidden ? 'none' : 'flex')};
  margin-top: 12px;
  :not(:last-child) {
    margin-right: ${CONTROL_MARGIN}px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  .ant-input-group-addon {
    padding: 0 6px;
  }
  > div {
    margin: 0 6px;
  }
`;

class FeaturesControlContainer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    flexDirection: PropTypes.string,
    modelComparisonParams: PropTypes.shape({
      nClusters: PropTypes.number,
    }),
    featureDistributionParams: PropTypes.shape({
      segmentGroups: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }),
  };

  static defaultProps = {
    className: '',
    flexDirection: 'row',
    modelComparisonParams: {nClusters: 4},
    featureDistributionParams: {segmentGroups: [[], []]},
  };

  _updateSegmentGroups = () => {
    const {
      hasBackend,
      featureDistributionParams,
      modelComparisonParams: {nClusters},
    } = this.props;
    // segmentGroups is a list of 2 lists of segment id's
    const segmentGroups = [
      this.cgInput0.input.value,
      this.cgInput1.input.value,
    ].map(g => g.match(/\d+/g).map(Number));
    segmentGroups.forEach(segmentGroup => segmentGroup.sort((a, b) => a - b));

    if (isValidSegmentGroups(segmentGroups, nClusters)) {
      this.props.updateSegmentGroups(segmentGroups);
      if (hasBackend) {
        this.props.fetchFeatures({
          ...featureDistributionParams,
          segmentGroups,
        });
      }
    } else {
      /* eslint-disable no-console */
      console.warn('invalid segment groups');
      /* eslint-enable no-console */
    }
  };

  render() {
    const {
      className,
      flexDirection,
      featureDistributionParams: {segmentGroups},
    } = this.props;
    const isHorizontal = flexDirection === 'row';
    return (
      <ContainerDimensions>
        {({width, height}) => (
          <div className={className}>
            <StyledControl
              name="compare"
              isHidden={isHorizontal && width < WIDTH_LADDER[0]}
            >
              <InputGroup style={{width: CONTROL_WIDTH[0]}}>
                <Input
                  size="small"
                  addonBefore="segment"
                  style={{
                    borderLeft: '3px solid #ff0099',
                    borderRadius: '4px',
                  }}
                  placeholder={segmentGroups[0].join(',')}
                  ref={input => {
                    this.cgInput0 = input;
                  }}
                  onPressEnter={this._updateSegmentGroups}
                />
                <div> {'vs.'} </div>
                <Input
                  size="small"
                  addonBefore="segment"
                  style={{
                    borderLeft: '3px solid #999999',
                    borderRadius: '4px',
                  }}
                  placeholder={segmentGroups[1].join(',')}
                  ref={input => {
                    this.cgInput1 = input;
                  }}
                  onPressEnter={this._updateSegmentGroups}
                />
              </InputGroup>
            </StyledControl>
            <StyledControl
              name={'difference metric'}
              isHidden={isHorizontal && width < WIDTH_LADDER[1]}
            >
              <Select defaultValue="kl-divergence" size="small">
                <Select.Option value="kl-divergence">
                  KL-Divergence
                </Select.Option>
                <Select.Option value="bhattacharyya" disabled={true}>
                  Bhattacharyya
                </Select.Option>
                <Select.Option value="shap" disabled={true}>
                  Shap
                </Select.Option>
              </Select>
            </StyledControl>
            <StyledControl
              name={'difference filter'}
              isHidden={isHorizontal && width < WIDTH_LADDER[2]}
            >
              <Slider
                style={{width: CONTROL_WIDTH[2], margin: '6px'}}
                min={0}
                max={1}
                step={0.01}
                defaultValue={this.props.divergenceThreshold}
                onChange={this.props.updateDivergenceThreshold}
              />
            </StyledControl>
          </div>
        )}
      </ContainerDimensions>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturesControlContainer);
