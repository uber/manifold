import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from '../custom-connect';
import {
  STATE_DATA_TYPES,
  COLORS,
  CONTROL_MARGIN,
  METRIC_OPTIONS,
  MODEL_TYPE_FROM_N_CLASSES,
  SEGMENTATION_METHOD,
} from '../constants';
import {StyledControl, InputButtons} from './ui/styled-components';
import {Select} from 'baseui/select';
import {Input, SIZE} from 'baseui/input';
import {computeWidthLadder} from '../utils';
import {SegmentFiltersControl} from './ui/segment-filters-control';
import {SegmentGroupsControl} from './ui/segment-groups-control';

import {
  updateMetric,
  updateSegmentationMethod,
  updateBaseCols,
  updateNClusters,
  updateSegmentFilters,
  updateSegmentGroups,
} from '../actions';
import {
  getHasBackend,
  getIsManualSegmentation,
  getMetric,
  getIsModelsComparisonLoading,
  getBaseCols,
  getNClusters,
  getSegmentGroups,
  getSegmentFilters,
} from '../selectors/base';
import {getModelsMeta, getColumnDefs} from '../selectors/compute';
import {getSegmentIds} from '../selectors/adaptors';
import {assert} from '@tensorflow/tfjs-core/dist/util';

const CONTROL_WIDTH = [130, 120, 100];
// remove some elements based on parent width
const WIDTH_LADDER = computeWidthLadder(CONTROL_WIDTH, CONTROL_MARGIN);

const mapDispatchToProps = {
  updateMetric,
  updateSegmentationMethod,
  updateBaseCols,
  updateNClusters,
  updateSegmentFilters,
  updateSegmentGroups,
};
const mapStateToProps = (state, props) => {
  return {
    hasBackend: getHasBackend(state),
    modelsMeta: getModelsMeta(state),
    columnDefs: getColumnDefs(state),
    metric: getMetric(state),
    isManualSegmentation: getIsManualSegmentation(state),
    baseCols: getBaseCols(state),
    nClusters: getNClusters(state),
    segmentFilters: getSegmentFilters(state),
    segmentGroups: getSegmentGroups(state),

    segmentIds: getSegmentIds(state),
    isModelsComparisonLoading: getIsModelsComparisonLoading(state),
  };
};

class PerformanceComparisonControlContainer extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    width: PropTypes.number,
    flexDirection: PropTypes.string,
    isModelsComparisonLoading: PropTypes.bool,
    hasBackend: PropTypes.bool,

    modelsMeta: STATE_DATA_TYPES.modelsMeta,
    metric: STATE_DATA_TYPES.metric,
    isManualSegmentation: STATE_DATA_TYPES.isManualSegmentation,
    baseCols: STATE_DATA_TYPES.baseCols,
    nClusters: STATE_DATA_TYPES.nClusters,
    segmentFilters: STATE_DATA_TYPES.segmentFilters,
    segmentGroups: STATE_DATA_TYPES.segmentGroups,
  };

  static defaultProps = {
    className: '',
    width: 240,
    flexDirection: 'row',
    modelComparisonParams: {nClusters: 4},
    isModelsComparisonLoading: false,
    hasBackend: false,
    modelsMeta: {},
    metric: {},
    isManualSegmentation: false,
  };

  _renderInputButtons = () => {
    const {isModelsComparisonLoading, isManualSegmentation} = this.props;
    return (
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
    );
  };

  _onUpdateMetric = ({value}) => {
    assert(value && value.length, '`value` must be a non-empty array');
    this.props.updateMetric(value[0]);
  };

  _onUpdateSegmentationMethod = ({value}) => {
    assert(value && value.length, '`value` must be a non-empty array');
    this.props.updateSegmentationMethod(value[0].id);
  };

  _onUpdateBaseCols = ({value}) => {
    assert(value && value.length, '`value` must be a non-empty array');
    const colIds = value.map(col => col.tableFieldIndex - 1).sort();
    this.props.updateBaseCols(colIds);
  };

  _onUpdateNClusters = ({isInc}) => {
    this.props.updateNClusters(isInc ? 'INC' : 'DEC');
  };

  _updateSegmentGroups = segmentGroups => {
    const {hasBackend, featureDistributionParams} = this.props;

    // TODO constraints each group should have at least one segment
    this.props.updateSegmentGroups(segmentGroups);
    // TODO do we still need the hasBackend logic?
    if (hasBackend) {
      this.props.fetchFeatures({
        ...featureDistributionParams,
        segmentGroups,
      });
    }
  };

  render() {
    // todo: support comparison view for multi-class cases
    const {
      className,
      width,
      flexDirection,
      isModelsComparisonLoading,
      modelsMeta: {nClasses},
      columnDefs,
      metric,
      isManualSegmentation,
      baseCols,
      nClusters,
      segmentFilters,
      segmentIds,
      segmentGroups,
    } = this.props;
    const isHorizontal = flexDirection === 'row';
    const modelType = MODEL_TYPE_FROM_N_CLASSES(nClasses);

    // reset SegmentFiltersControl to default state whenever baseCols change
    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
    const segmentFilterControlKey = baseCols
      .slice()
      .sort()
      .join(',');

    return (
      <div className={className}>
        <StyledControl
          name="Performance Metric"
          stackDirection={flexDirection}
          isHidden={isHorizontal && width < WIDTH_LADDER[2]}
        >
          <Select
            options={METRIC_OPTIONS[modelType]}
            labelKey="name"
            size={SIZE.compact}
            searchable={false}
            onChange={this._onUpdateMetric}
            value={metric}
          />
        </StyledControl>
        <StyledControl
          name="Segmentation method"
          isHidden={isHorizontal && width < WIDTH_LADDER[0]}
        >
          <Select
            disabled={isModelsComparisonLoading}
            options={[
              {id: SEGMENTATION_METHOD.AUTO},
              {id: SEGMENTATION_METHOD.MANUAL},
            ]}
            labelKey="id"
            valueKey="id"
            size={SIZE.compact}
            searchable={false}
            onChange={this._onUpdateSegmentationMethod}
            value={
              isManualSegmentation
                ? {id: SEGMENTATION_METHOD.MANUAL}
                : {id: SEGMENTATION_METHOD.AUTO}
            }
          />
        </StyledControl>
        <StyledControl
          name={isManualSegmentation ? 'Filter by' : 'Cluster by'}
          stackDirection={flexDirection}
          isHidden={isHorizontal && width < WIDTH_LADDER[1]}
        >
          <Select
            size={SIZE.compact}
            options={columnDefs}
            value={baseCols.map(colId => columnDefs[colId])}
            labelKey="name"
            valueKey="name"
            onChange={this._onUpdateBaseCols}
            searchable={true}
            multi={true}
          />
        </StyledControl>
        {!isManualSegmentation && (
          <StyledControl
            name="Number of clusters"
            stackDirection={flexDirection}
            isHidden={isHorizontal && width < WIDTH_LADDER[2]}
          >
            <Input
              overrides={{
                After: this._renderInputButtons,
              }}
              value={nClusters}
              size={SIZE.compact}
            />
          </StyledControl>
        )}
        {isManualSegmentation && (
          <StyledControl
            name="Filters"
            stackDirection={flexDirection}
            isHidden={isHorizontal && width < WIDTH_LADDER[0]}
          >
            <SegmentFiltersControl
              key={segmentFilterControlKey}
              columnDefs={columnDefs}
              segmentFilters={segmentFilters}
              onUpdateSegmentFilters={this.props.updateSegmentFilters}
            />
          </StyledControl>
        )}
        <StyledControl
          name="Grouping segments"
          stackDirection={flexDirection}
          isHidden={isHorizontal && width < WIDTH_LADDER[0]}
        >
          <SegmentGroupsControl
            candidates={segmentIds}
            selected={segmentGroups}
            onUpdateSegmentGroups={this._updateSegmentGroups}
            colors={[COLORS.PINK, COLORS.BLUE]}
          />
        </StyledControl>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PerformanceComparisonControlContainer);
