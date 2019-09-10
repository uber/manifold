import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {
  CHART_DEFAULT_PROPS,
  CHART_PROP_TYPES,
} from '@mlvis/mlvis-common/constants';
import {withXYScales} from '@mlvis/mlvis-common/utils';
import MultiWayGroup from './multi-way-group';
import {Axis, axisPropsFromTickScale} from 'react-d3-axis';

const FONT_STYLE = {
  fontSize: 13,
};

class MultiWayPlot extends PureComponent {
  static propTypes = {
    ...CHART_PROP_TYPES,
    /** selected data categories, passed down to MultiWayUnit **/
    selectedIds: PropTypes.arrayOf(PropTypes.number),
    /** whether this MultiWayPlot is a thumbnail **/
    isThumbnail: PropTypes.bool,
  };
  static defaultProps = {
    ...CHART_DEFAULT_PROPS,
    selectedIds: [],
    isThumbnail: false,
  };

  _renderAxis = () => {
    const {padding, width, height, xScale, xLabel, isThumbnail} = this.props;
    return (
      <g transform={`translate(${padding.left}, ${height - padding.bottom})`}>
        <Axis
          {...axisPropsFromTickScale(xScale, 10)}
          style={{strokeColor: '#666'}}
        />
        {!isThumbnail && (
          <text x={width * 0.5} y={28} textAnchor="middle" fill="#666">
            {xLabel}
          </text>
        )}
      </g>
    );
  };

  _renderMultiWayGroup = () => {
    const {
      padding,
      xScale,
      yScale,
      colorScale,
      data,
      yRangeByGroup,
      ordering,
      selectedIds,
      isThumbnail,
    } = this.props;
    const groupContent = data.map((element, groupId) => {
      const order = ordering.indexOf(groupId);
      const yScaleGroup = scaleLinear()
        .domain(yRangeByGroup[groupId])
        .range([0, 0.5 * yScale.bandwidth()]);
      const layout = {
        y: yScale(order) + 0.5 * yScale.bandwidth(),
        width: xScale.range()[1],
        height: yScale.bandwidth(),
      };
      // If element is an object, the component will think of it as pre-computed data (instead of raw data).
      const elementObj = Array.isArray(element) ? {} : element;
      return (
        <MultiWayGroup
          key={groupId}
          id={groupId}
          data={element}
          xScale={xScale}
          yScale={yScaleGroup}
          colorScale={colorScale}
          selectedIds={selectedIds}
          isThumbnail={isThumbnail}
          {...layout}
          // Pre-computed data will contain contents in derivedData, its keys can be direclty passed as props to children components.
          {...elementObj}
        />
      );
    });
    return (
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {groupContent}
      </g>
    );
  };

  render() {
    const {width, height, data, isThumbnail} = this.props;
    if (width <= 0 || height <= 0 || !data) {
      return null;
    }
    return (
      <svg width={width} height={height} {...FONT_STYLE} pointerEvents="none">
        {this._renderMultiWayGroup()}
        {!isThumbnail && this._renderAxis()}
      </svg>
    );
  }
}

export default withXYScales(MultiWayPlot);
