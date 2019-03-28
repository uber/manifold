// @noflow
import React, {PureComponent} from 'react';
import ContainerDimensions from 'react-container-dimensions';
import styled from 'styled-components';
import {connect} from '../custom-connect';
import {scaleOrdinal} from 'd3-scale';
import {schemeSet2 as colorScheme} from 'd3-scale-chromatic';

import MultiWayPlot from 'packages/multi-way-plot/';
import {LegendGroup} from 'packages/mlvis-common/ui';
import SegmentGrouping from 'packages/multi-way-plot/segment-grouping';

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
  left: 5,
  right: 5,
  top: 0,
  bottom: 50,
};

const LEGEND_HEIGHT = 20;
const GROUPING_WIDTH = 16;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const StyledLegend = styled(LegendGroup)`
  margin-bottom: 50px;
`;

const Content = styled.div`
  display: flex;
`;

const mapDispatchToProps = {
  updateSelectedModels,
};

const mapStateToProps = (state, props) => {
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

    colorScale: scaleOrdinal(colorScheme).domain(modelIds),
    selectedModels: getSelectedModels(state),
    segmentOrdering: getSegmentOrdering(state),
  };
};

class MultiModelComparisonContainer extends PureComponent {
  static propTypes = {};

  render() {
    const {
      data,
      modelMeta,
      metric,
      segmentIds,
      rawDataRange,
      segmentOrdering,
      densityRange,
      xScale,
      yScale,
      colorScale,
      selectedModels,
      segmentGroups,
    } = this.props;
    if (!data) {
      return null;
    }
    return (
      <Container>
        <StyledLegend
          data={modelMeta}
          colorScale={colorScale}
          onModelSelect={this.props.updateSelectedModels}
          selectedModels={selectedModels}
        />
        <ContainerDimensions>
          {({width, height}) => (
            <Content>
              <MultiWayPlot
                width={width - GROUPING_WIDTH}
                height={height - LEGEND_HEIGHT}
                segmentIds={segmentIds}
                rawDataRange={rawDataRange}
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
              <SegmentGrouping
                height={height - LEGEND_HEIGHT}
                width={GROUPING_WIDTH}
                segmentGroups={segmentGroups}
                rawDataRange={rawDataRange}
                segmentIds={segmentIds}
                padding={PADDING}
              />
            </Content>
          )}
        </ContainerDimensions>
      </Container>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiModelComparisonContainer);
