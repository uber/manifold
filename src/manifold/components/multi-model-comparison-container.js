// @noflow
import React, {PureComponent} from 'react';
import {connect} from '../custom-connect';
import {Row, Col} from 'antd';
import {scaleBand, scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeSet2 as colorScheme} from 'd3-scale-chromatic';

import MultiWayPlot from '@uber/multi-way-plot/';
import LegendGroup from '@uber/mlvis-common-ui/legend-group/';
import SegmentGrouping from '@uber/multi-way-plot/segment-grouping';

import {updateSelectedModels} from '../actions';
import {
  getModels,
  getRawDataRange,
  getDensityRange,
  getModelIds,
  getModelMeta,
  getDisplayMetric,
} from '../selectors/adaptors';
import {
  getFeatureDistributionParams,
  getRawSegmentIds,
  getSelectedModels,
  getSegmentOrdering,
} from '../selectors/base';

const PADDING = {
  left: 15,
  right: 15,
  top: 0,
  bottom: 45,
};

const mapDispatchToProps = {
  updateSelectedModels,
};

const mapStateToProps = (state, props) => {
  const {width, height} = props;
  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;

  const segmentIds = getRawSegmentIds(state);
  const modelIds = getModelIds(state);
  const rawDataRange = getRawDataRange(state);
  const {segmentGroups} = getFeatureDistributionParams(state);

  return {
    data: getModels(state),
    segmentIds,
    modelIds,
    rawDataRange,
    densityRange: getDensityRange(state),
    modelMeta: getModelMeta(state),
    metric: getDisplayMetric(state),
    segmentGroups,

    xScale: scaleLinear()
      .domain(rawDataRange)
      .range([0, innerWidth]),
    yScale: scaleBand()
      .domain(segmentIds)
      .range([innerHeight, 0])
      .padding(0.1),
    colorScale: scaleOrdinal(colorScheme).domain(modelIds),
    selectedModels: getSelectedModels(state),
    segmentOrdering: getSegmentOrdering(state),
  };
};

class MultiModelComparisonContainer extends PureComponent {
  static propTypes = {};
  get style() {
    return {
      root: {
        display: 'flex',
        padding: '20px 12px',
      },
      padded: {
        paddingBottom: '50px',
      },
    };
  }

  _renderModels = () => {
    const {modelMeta, colorScale, selectedModels} = this.props;
    return (
      <div id={'legendGroup'} style={this.style.padded}>
        <LegendGroup
          data={modelMeta}
          colorScale={colorScale}
          onModelSelect={this.props.updateSelectedModels}
          selectedModels={selectedModels}
        />
      </div>
    );
  };

  _renderGrouping = () => {
    const {data, segmentGroups, yScale} = this.props;
    if (!data) {
      return null;
    }
    return (
      <SegmentGrouping
        segmentGroups={segmentGroups}
        yScale={yScale}
        padding={PADDING}
      />
    );
  };

  _renderChart = () => {
    const {
      width,
      height,
      data,
      metric,
      segmentOrdering,
      densityRange,
      xScale,
      yScale,
      colorScale,
      selectedModels,
    } = this.props;
    if (!data) {
      return null;
    }
    return (
      <MultiWayPlot
        width={width}
        height={height}
        padding={PADDING}
        data={data}
        ordering={segmentOrdering}
        xLabel={metric}
        xScale={xScale}
        yScale={yScale}
        colorScale={colorScale}
        yScaleGroupRange={densityRange}
        selectedModels={selectedModels}
      />
    );
  };

  render() {
    return (
      <Row style={this.style.root}>
        <Col span={2}>{this._renderModels()}</Col>
        <Col span={21}>{this._renderChart()}</Col>
        <Col span={1}>{this._renderGrouping()}</Col>
      </Row>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiModelComparisonContainer);
