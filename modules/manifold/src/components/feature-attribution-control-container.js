import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from '../custom-connect';
import {StyledControl, StyledSlider} from './ui/styled-components';
import {FEATURE_TYPE} from '@mlvis/mlvis-common/constants';
import {CONTROL_MARGIN} from '../constants';

import {
  fetchFeatures,
  updateDivergenceThreshold,
  updateSegmentFilters,
  updateSegmentGroups,
} from '../actions';
import {getDivergenceThreshold, getSegmentFilters} from '../selectors/base';
import {computeWidthLadder} from '../utils';

const mapDispatchToProps = {
  fetchFeatures,
  updateDivergenceThreshold,
  updateSegmentFilters,
  updateSegmentGroups,
};
const mapStateToProps = (state, props) => {
  return {
    divergenceThreshold: getDivergenceThreshold(state),
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
    fetchFeatures: PropTypes.func,
    updateSegmentFilters: PropTypes.func,
    updateSegmentGroups: PropTypes.func,
    updateDivergenceThreshold: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    flexDirection: 'row',
    width: 240,
    nClusters: 4,
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

  render() {
    const {
      className,
      width,
      flexDirection,
      divergenceThreshold,
      updateDivergenceThreshold,
    } = this.props;

    // TODO not super heavy for dotRange we should not remove it from render
    const isHorizontal = flexDirection === 'row';
    return (
      <div className={className}>
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
