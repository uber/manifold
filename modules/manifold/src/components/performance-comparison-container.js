import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {connect} from '../custom-connect';
import {scaleBand, scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeSet2 as colorScheme} from 'd3-scale-chromatic';

import MultiWayPlot from 'packages/multi-way-plot/';
import {LegendGroup} from './ui';
import SegmentGrouping from 'packages/multi-way-plot/segment-grouping';

import {COLORS} from '../constants';
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
  left: 2,
  right: 2,
  top: 0,
  bottom: 45,
};
const PADDING_THUMBNAIL = {
  left: 8,
  right: 8,
  top: 0,
  bottom: 2,
};

const GET_YSCALE = () => scaleBand().padding(0.1);

const LEGEND_HEIGHT = 30;
const GROUPING_WIDTH = 20;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const StyledLegend = styled(LegendGroup)`
  margin-top: 10px;
`;

const Content = styled.div`
  display: flex;
`;

const mapDispatchToProps = {
  updateSelectedModels,
};

const mapStateToProps = (state, props) => {
  const modelIds = getModelIds(state) || [];
  const {segmentGroups} = getFeatureDistributionParams(state) || [];

  return {
    data: getModels(state),
    segmentIds: getRawSegmentIds(state),

    rawDataRange: getRawDataRange(state),
    densityRange: getDensityRange(state),
    modelMeta: getModelMeta(state),
    metric: getDisplayMetric(state),
    segmentGroups,
    colorScale: scaleOrdinal(colorScheme).domain(modelIds),
    selectedModels: getSelectedModels(state),
    segmentOrdering: getSegmentOrdering(state),
  };
};

export class PerformanceComparisonContainer extends PureComponent {
  static propTypes = {
    /* function to select manifold state from redux state of an application; `state => state.path.to.manifold.state` */
    selector: PropTypes.func,
    // todo: update with detailed propTypes
    data: PropTypes.arrayOf(PropTypes.object),
    width: PropTypes.number,
    height: PropTypes.number,
    groupColors: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    groupColors: [COLORS.PINK, COLORS.BLUE],
  };

  render() {
    const {
      data,
      width,
      height,
      modelMeta,
      metric,
      segmentIds,
      rawDataRange,
      segmentOrdering,
      densityRange,
      colorScale,
      selectedModels,
      segmentGroups,
      groupColors,
      isThumbnail,
    } = this.props;
    if (!data) {
      return null;
    }
    const padding = isThumbnail ? PADDING_THUMBNAIL : PADDING;
    return (
      <Container ref={this.container} key="perf-comp">
        {!isThumbnail && (
          <StyledLegend
            data={modelMeta}
            colorScale={colorScale}
            onModelSelect={this.props.updateSelectedModels}
            selectedModels={selectedModels}
          />
        )}
        <Content>
          <MultiWayPlot
            width={width - GROUPING_WIDTH}
            height={isThumbnail ? height : height - LEGEND_HEIGHT}
            padding={padding}
            data={data}
            metaData={modelMeta}
            ordering={segmentOrdering}
            xLabel={metric}
            getXScale={scaleLinear}
            xDomain={rawDataRange}
            getYScale={GET_YSCALE}
            yDomain={segmentIds}
            colorScale={colorScale}
            yRangeByGroup={densityRange}
            isThumbnail={isThumbnail}
          />
          <SegmentGrouping
            height={isThumbnail ? height : height - LEGEND_HEIGHT}
            width={GROUPING_WIDTH}
            getYScale={GET_YSCALE}
            yDomain={segmentIds}
            segmentGroups={segmentGroups}
            groupColors={groupColors}
            padding={padding}
            isThumbnail={isThumbnail}
          />
        </Content>
      </Container>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PerformanceComparisonContainer);
