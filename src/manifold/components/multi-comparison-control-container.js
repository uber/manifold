// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ContainerDimensions from 'react-container-dimensions';
import {connect} from '../custom-connect';
import {Control} from 'packages/mlvis-common/ui';
import {Button, Input, Select, Radio} from 'antd';
import {CONTROL_MARGIN} from '../constants';
import {computeWidthLadder} from '../utils';

import {
  fetchModels,
  fetchFeatures,
  updateMetric,
  updateNClusters,
  updateSegmentationMethod,
  updateSegmentFilters,
  updateSegmentGroups,
} from '../actions';
import {
  getHasBackend,
  getIsModelsComparisonLoading,
  getModelsComparisonParams,
  getIsManualSegmentation,
} from '../selectors/base';
import {getMetaData} from '../selectors/data';

const CONTROL_WIDTH = [130, 120, 100];
// remove some elements based on parent width
const WIDTH_LADDER = computeWidthLadder(CONTROL_WIDTH, CONTROL_MARGIN);

const StyledControl = styled(Control)`
  display: ${props => (props.isHidden ? 'none' : 'flex')};
  margin-top: 12px;
  :not(:last-child) {
    margin-right: ${CONTROL_MARGIN}px;
  }
`;

const mapDispatchToProps = {
  fetchFeatures,
  fetchModels,
  updateMetric,
  updateNClusters,
  updateSegmentationMethod,
  updateSegmentFilters,
  updateSegmentGroups,
};
const mapStateToProps = (state, props) => {
  const {modelMetaData = {}} = getMetaData(state);
  return {
    hasBackend: getHasBackend(state),
    modelMetaData,
    modelComparisonParams: getModelsComparisonParams(state),
    isModelsComparisonLoading: getIsModelsComparisonLoading(state),
    isManualSegmentation: getIsManualSegmentation(state),
  };
};

class MultiComparisonControlContainer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    flexDirection: PropTypes.string,
    modelComparisonParams: PropTypes.shape({
      nClusters: PropTypes.number,
    }),
    isModelsComparisonLoading: PropTypes.bool,
    isManualSegmentation: PropTypes.bool,
    hasBackend: PropTypes.bool,
    modelMetaData: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    flexDirection: 'row',
    modelComparisonParams: {nClusters: 4},
    isModelsComparisonLoading: false,
    isManualSegmentation: false,
    hasBackend: false,
    modelMetaData: {},
  };

  _onUpdateNClusters = ({isInc}) => {
    const {modelComparisonParams, hasBackend} = this.props;
    const {nClusters} = modelComparisonParams;

    this.props.updateNClusters(isInc ? 'INC' : 'DEC');
    if (hasBackend) {
      this.props.fetchModels({
        ...modelComparisonParams,
        nClusters: nClusters + (isInc ? 1 : -1),
      });
    }
  };

  _onUpdateMetric = metric => {
    const {modelComparisonParams, hasBackend} = this.props;
    this.props.updateMetric(metric);
    if (hasBackend) {
      this.props.fetchModels({
        ...modelComparisonParams,
        metric,
      });
    }
  };

  _onUpdateSegmentationMethod = e => {
    this.props.updateSegmentationMethod(e.target.value);
  };

  render() {
    // todo: support comparison view for multi-class cases
    const {
      className,
      flexDirection,
      modelComparisonParams,
      isModelsComparisonLoading,
      isManualSegmentation,
      modelMetaData: {nClasses = 1} = {},
    } = this.props;
    const {nClusters} = modelComparisonParams;
    const isHorizontal = flexDirection === 'row';
    return (
      <ContainerDimensions>
        {({width, height}) => (
          <div className={className}>
            <StyledControl
              name={'segmentation method'}
              isHidden={isHorizontal && width < WIDTH_LADDER[0]}
            >
              <Radio.Group
                defaultValue="auto"
                size="small"
                disabled={isModelsComparisonLoading}
                value={isManualSegmentation ? 'manual' : 'auto'}
                onChange={this._onUpdateSegmentationMethod}
              >
                <Radio.Button value="auto">Auto</Radio.Button>
                <Radio.Button value="manual">Manual</Radio.Button>
              </Radio.Group>
            </StyledControl>
            <StyledControl
              name={'metric'}
              isHidden={isHorizontal && width < WIDTH_LADDER[1]}
            >
              <Select
                defaultValue="performance"
                style={{width: CONTROL_WIDTH[1]}}
                size="small"
                disabled={isModelsComparisonLoading}
                onChange={this._onUpdateMetric}
              >
                <Select.Option value="actual" disabled={nClasses > 2}>
                  Actual
                </Select.Option>
                <Select.Option value="performance">Performance</Select.Option>
              </Select>
            </StyledControl>
            <StyledControl
              name={'n_clusters'}
              isHidden={isHorizontal && width < WIDTH_LADDER[2]}
            >
              <Input.Group
                style={{width: CONTROL_WIDTH[2], display: 'flex'}}
                compact
              >
                <Input value={nClusters} size="small" readOnly />
                <Button
                  size="small"
                  style={{width: 24}}
                  disabled={isModelsComparisonLoading || isManualSegmentation}
                  onClick={() => this._onUpdateNClusters({isInc: false})}
                >
                  -
                </Button>
                <Button
                  size="small"
                  style={{width: 24}}
                  disabled={isModelsComparisonLoading || isManualSegmentation}
                  onClick={() => this._onUpdateNClusters({isInc: true})}
                >
                  +
                </Button>
              </Input.Group>
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
)(MultiComparisonControlContainer);
