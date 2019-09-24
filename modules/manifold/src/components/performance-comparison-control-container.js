import React, {PureComponent} from 'react';
import {createSelector} from 'reselect';
import PropTypes from 'prop-types';
import {connect} from '../custom-connect';
import {
  COLORS,
  CONTROL_MARGIN,
  METRIC_OPTIONS,
  MODEL_TYPE,
  SEGMENTATION_METHOD,
} from '../constants';
import {FILTER_TYPE} from '@mlvis/mlvis-common/constants';
import {StyledControl, InputButtons} from './ui/styled-components';
import {Select} from 'baseui/select';
import {Input, SIZE} from 'baseui/input';
import {computeWidthLadder} from '../utils';
import {SegmentFilterPanel} from './ui/segment-filter-panel';
import {SegmentGroupPanel} from './ui/segment-group-panel';

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
    isManualSegmentation: PropTypes.bool,
    metric: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      func: PropTypes.func.isRequired,
    }),
    baseCols: PropTypes.arrayOf(PropTypes.number),
    nClusters: PropTypes.number,
    /** input segment filters, each of shape key, value, and type */
    segmentFilters: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          key: PropTypes.number.isRequired,
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

  _getMetricOptions = createSelector(
    [state => state.metricOptions, state => state.nClasses],
    (metricOptions, nClasses) => {
      const modelType =
        nClasses === 1
          ? MODEL_TYPE.REGRESSION
          : nClasses === 2
          ? MODEL_TYPE.BIN_CLASS
          : MODEL_TYPE.MULT_CLASS;

      return metricOptions[modelType].map((metric, i) => ({
        id: i,
        label: metric.name,
      }));
    }
  );

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
    this.props.updateMetric(value[0]);
  };

  _onUpdateSegmentationMethod = ({value}) => {
    this.props.updateSegmentationMethod(value[0].id);
  };

  _onUpdateBaseCols = ({value}) => {
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
    const modelType =
      nClasses === 1
        ? MODEL_TYPE.REGRESSION
        : nClasses === 2
        ? MODEL_TYPE.BIN_CLASS
        : MODEL_TYPE.MULT_CLASS;
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
          name="Base columns"
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
            name="Segments"
            stackDirection={flexDirection}
            isHidden={isHorizontal && width < WIDTH_LADDER[0]}
          >
            {baseCols.slice(0, 1).map(colId => (
              <SegmentFilterPanel
                key={colId}
                segmentationFeatureMeta={columnDefs[colId]}
                segmentFilters={segmentFilters}
                onUpdateSegmentFilters={this.props.updateSegmentFilters}
              />
            ))}
          </StyledControl>
        )}
        {/* {!isManualSegmentation && ( */}
        <StyledControl
          name="Segment grouping"
          stackDirection={flexDirection}
          isHidden={isHorizontal && width < WIDTH_LADDER[0]}
        >
          <SegmentGroupPanel
            candidates={segmentIds}
            selected={segmentGroups}
            onUpdateSegmentGroups={this._updateSegmentGroups}
            colors={[COLORS.PINK, COLORS.BLUE]}
          />
        </StyledControl>
        {/* )} */}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PerformanceComparisonControlContainer);
