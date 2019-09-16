import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from '../custom-connect';
import {CONTROL_MARGIN} from '../constants';
import {
  StyledControl,
  StyledSelect,
  StyledInput,
  InputButtons,
  SelectArrow,
} from './ui/styled-components';
import {Select, SIZE} from 'baseui/select';
import {computeWidthLadder} from '../utils';

import {
  fetchModels,
  fetchFeatures,
  updateMetric,
  updateNClusters,
  updateSegmentationMethod,
  updateSegmentGroups,
} from '../actions';
import {
  getHasBackend,
  getIsModelsComparisonLoading,
  getModelsComparisonParams,
  getIsManualSegmentation,
  getMetric,
} from '../selectors/base';
import {getModelsMeta} from '../selectors/compute';

const CONTROL_WIDTH = [130, 120, 100];
// remove some elements based on parent width
const WIDTH_LADDER = computeWidthLadder(CONTROL_WIDTH, CONTROL_MARGIN);

const mapDispatchToProps = {
  fetchFeatures,
  fetchModels,
  updateMetric,
  updateNClusters,
  updateSegmentationMethod,
  updateSegmentGroups,
};
const mapStateToProps = (state, props) => {
  return {
    hasBackend: getHasBackend(state),
    metric: getMetric(state),
    modelsMeta: getModelsMeta(state),
    modelComparisonParams: getModelsComparisonParams(state),
    isModelsComparisonLoading: getIsModelsComparisonLoading(state),
    isManualSegmentation: getIsManualSegmentation(state),
  };
};

class PerfroamnceComparisonControlContainer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    width: PropTypes.number,
    flexDirection: PropTypes.string,
    modelComparisonParams: PropTypes.shape({
      nClusters: PropTypes.number,
    }),
    isModelsComparisonLoading: PropTypes.bool,
    isManualSegmentation: PropTypes.bool,
    hasBackend: PropTypes.bool,
    modelsMeta: PropTypes.shape({
      nClasses: PropTypes.number,
    }),
  };

  static defaultProps = {
    className: '',
    width: 240,
    flexDirection: 'row',
    modelComparisonParams: {nClusters: 4},
    isModelsComparisonLoading: false,
    isManualSegmentation: false,
    hasBackend: false,
    modelsMeta: {},
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
      width,
      flexDirection,
      metric,
      modelComparisonParams,
      isModelsComparisonLoading,
      isManualSegmentation,
      modelsMeta: {nClasses = 1} = {},
    } = this.props;
    const {nClusters} = modelComparisonParams;
    const isHorizontal = flexDirection === 'row';
    return (
      <div className={className}>
        <StyledControl
          name="Segmentation Method"
          isHidden={isHorizontal && width < WIDTH_LADDER[0]}
        >
          <StyledSelect>
            <select
              defaultValue="auto"
              disabled={isModelsComparisonLoading}
              onChange={this._onUpdateSegmentationMethod}
            >
              <option value="auto">Auto</option>
              <option value="manual">Manual</option>
            </select>
            <SelectArrow height="16" />
          </StyledSelect>
        </StyledControl>
        {!isManualSegmentation && (
          <StyledControl
            name="Comparison Metric"
            stackDirection={flexDirection}
            isHidden={isHorizontal && width < WIDTH_LADDER[1]}
          >
            <StyledSelect>
              <select
                defaultValue="performance"
                disabled={isModelsComparisonLoading}
                onChange={this._onUpdateMetric}
              >
                <option value="actual" disabled={nClasses > 2}>
                  Ground Truth
                </option>
                <option value="performance">Performance</option>
              </select>
              <SelectArrow height="16" />
            </StyledSelect>
          </StyledControl>
        )}
        {!isManualSegmentation && (
          <StyledControl
            name="N_Segments"
            stackDirection={flexDirection}
            isHidden={isHorizontal && width < WIDTH_LADDER[2]}
          >
            <StyledInput>
              <input value={nClusters} size="small" readOnly />
              <InputButtons>
                <button
                  disabled={isModelsComparisonLoading || isManualSegmentation}
                  onClick={() => this._onUpdateNClusters({isInc: false})}
                >
                  -
                </button>
                <button
                  disabled={isModelsComparisonLoading || isManualSegmentation}
                  onClick={() => this._onUpdateNClusters({isInc: true})}
                >
                  +
                </button>
              </InputButtons>
            </StyledInput>
          </StyledControl>
        )}

        {/* <StyledControl
          name="N_Segments"
          stackDirection={flexDirection}
          isHidden={isHorizontal && width < WIDTH_LADDER[2]}
        >
          <ItemSelector
            selectedItems={metric}
            options={['actual', 'performance']}
            multiSelect={false}
            onChange={this._onUpdateMetric}
          />
        </StyledControl> */}
        <Select
          options={['actual', 'performance']}
          size={SIZE.compact}
          // labelKey="id"
          // valueKey="color"
          onChange={this._onUpdateMetric}
          value={metric}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PerfroamnceComparisonControlContainer);
