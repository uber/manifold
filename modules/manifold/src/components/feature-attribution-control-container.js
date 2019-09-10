import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from '../custom-connect';
import {
  StyledControl,
  StyledSlider,
  StyledSelect,
  SelectArrow,
} from './ui/styled-components';
import {SegmentFilterPanel, SegmentGroupPanel} from './ui/segment-panels';
import {dotRange} from '@mlvis/mlvis-common/utils';
import {FILTER_TYPE, FEATURE_TYPE} from '@mlvis/mlvis-common/constants';
import {CONTROL_MARGIN, COLORS} from '../constants';

import {
  fetchFeatures,
  updateDivergenceThreshold,
  updateSegmentFilters,
  updateSegmentGroups,
} from '../actions';
import {
  getDivergenceThreshold,
  getModelsComparisonParams,
  getFeatureDistributionParams,
  getIsManualSegmentation,
  getSegmentFilters,
} from '../selectors/base';
import {getFeaturesMeta} from '../selectors/compute';
import {computeWidthLadder, isValidSegmentGroups} from '../utils';

const mapDispatchToProps = {
  fetchFeatures,
  updateDivergenceThreshold,
  updateSegmentFilters,
  updateSegmentGroups,
};
const mapStateToProps = (state, props) => {
  return {
    featuresMeta: getFeaturesMeta(state),
    divergenceThreshold: getDivergenceThreshold(state),
    modelComparisonParams: getModelsComparisonParams(state),
    featureDistributionParams: getFeatureDistributionParams(state),
    isManualSegmentation: getIsManualSegmentation(state),
    segmentFilters: getSegmentFilters(state),
  };
};

const CONTROL_WIDTH = [320, 135, 100];
// remove some elements based on parent width
const WIDTH_LADDER = computeWidthLadder(CONTROL_WIDTH, CONTROL_MARGIN);

class FeatureAttributionControlContainer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    width: PropTypes.number,
    flexDirection: PropTypes.string,
    modelComparisonParams: PropTypes.shape({
      nClusters: PropTypes.number,
    }),
    featureDistributionParams: PropTypes.shape({
      segmentGroups: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }),
    featuresMeta: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        type: PropTypes.oneOf(Object.values(FEATURE_TYPE)),
        domain: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
          ])
        ),
      })
    ),
    divergenceThreshold: PropTypes.number,
    isManualSegmentation: PropTypes.bool,
    hasBackend: PropTypes.bool,
    /** input segment filters, each of shape key, value, and type */
    segmentFilters: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string.isRequired,
          value: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
            PropTypes.func,
            PropTypes.arrayOf(PropTypes.number),
            PropTypes.arrayOf(PropTypes.string),
            PropTypes.arrayOf(PropTypes.bool),
          ]).isRequired,
          type: PropTypes.oneOf(Object.values(FILTER_TYPE)),
        })
      )
    ),
    fetchFeatures: PropTypes.func,
    updateSegmentFilters: PropTypes.func,
    updateSegmentGroups: PropTypes.func,
    updateDivergenceThreshold: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    flexDirection: 'row',
    width: 240,
    modelComparisonParams: {nClusters: 4},
    featureDistributionParams: {segmentGroups: [[], []]},
    // add missing default props before refactoring
    divergenceThreshold: 1,
    isManualSegmentation: false,
    hasBackend: false,
    segmentFilters: undefined,
    fetchFeatures: () => {},
    updateSegmentFilters: () => {},
    updateSegmentGroups: () => {},
    updateDivergenceThreshold: () => {},
  };

  state = {
    segmentationFeatureId: 0,
  };

  _updateSegmentGroups = segmentGroups => {
    const {
      hasBackend,
      featureDistributionParams,
      modelComparisonParams: {nClusters},
    } = this.props;

    // TODO constraints each group should have at least one segment
    if (isValidSegmentGroups(segmentGroups, nClusters)) {
      this.props.updateSegmentGroups(segmentGroups);
      // TODO do we still need the hasBackend logic?
      if (hasBackend) {
        this.props.fetchFeatures({
          ...featureDistributionParams,
          segmentGroups,
        });
      }
    } else {
      /* eslint-disable no-console */
      // TODO this should be visible in the UI
      console.warn('invalid segment groups');
      /* eslint-enable no-console */
    }
  };

  _updateSegmentFeature = e => {
    const {value} = e.target;
    this.setState({
      segmentationFeatureId: value,
    });
  };

  render() {
    const {
      className,
      width,
      flexDirection,
      modelComparisonParams: {nClusters},
      featuresMeta,
      featureDistributionParams: {segmentGroups},
      divergenceThreshold,
      isManualSegmentation,
      segmentFilters,
      updateDivergenceThreshold,
    } = this.props;
    const {segmentationFeatureId} = this.state;

    // TODO not super heavy for dotRange we should not remove it from render
    const candidateSegments = dotRange(nClusters);
    const isHorizontal = flexDirection === 'row';
    return (
      <div className={className}>
        {isManualSegmentation && (
          <StyledControl
            name="Segmentation Metric"
            stackDirection={flexDirection}
            isHidden={isHorizontal && width < WIDTH_LADDER[1]}
          >
            <StyledSelect>
              <select
                value={segmentationFeatureId || 0}
                onChange={this._updateSegmentFeature}
              >
                {featuresMeta.map((feature, i) => (
                  <option value={i} key={i}>
                    {feature.name}
                  </option>
                ))}
              </select>
              <SelectArrow height="16" />
            </StyledSelect>
          </StyledControl>
        )}

        <StyledControl
          name="Comparison"
          stackDirection={flexDirection}
          isHidden={isHorizontal && width < WIDTH_LADDER[0]}
        >
          {isManualSegmentation ? (
            <SegmentFilterPanel
              segmentationFeatureMeta={featuresMeta[segmentationFeatureId]}
              segmentFilters={segmentFilters}
              onUpdateSegmentFilters={this.props.updateSegmentFilters}
            />
          ) : (
            <SegmentGroupPanel
              candidates={candidateSegments}
              selected={segmentGroups}
              onUpdateSegmentGroups={this._updateSegmentGroups}
              colors={[COLORS.PINK, COLORS.BLUE]}
            />
          )}
        </StyledControl>
        <StyledControl
          name="Difference filter"
          stackDirection={flexDirection}
          isHidden={isHorizontal && width < WIDTH_LADDER[1]}
        >
          <StyledSlider>
            <input
              type="range"
              id="difference-filter"
              min={0}
              max={1}
              step={0.01}
              value={divergenceThreshold}
              onChange={e => updateDivergenceThreshold(Number(e.target.value))}
            />
            <label>{divergenceThreshold}</label>
          </StyledSlider>
        </StyledControl>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureAttributionControlContainer);
