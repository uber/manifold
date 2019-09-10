import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import MultiWayUnit from './multi-way-unit';
import {withDerivedDataGroup as withDerivedData} from './utils';
import {
  CHART_DEFAULT_PROPS,
  CHART_PROP_TYPES,
} from '@mlvis/mlvis-common/constants';

class MultiWayGroup extends PureComponent {
  static propTypes = {
    ...CHART_PROP_TYPES,
    numDataPoints: PropTypes.number,
    selectedIds: PropTypes.arrayOf(PropTypes.number),
  };

  static defaultProps = {
    ...CHART_DEFAULT_PROPS,
    numDataPoints: 0,
    selectedIds: [],
  };

  _renderMultiWayUnit = () => {
    const {
      xScale,
      yScale,
      colorScale,
      data,
      width,
      height,
      selectedIds,
    } = this.props;
    return (
      <g id="segment">
        {data.map((element, i) => {
          // If element is an object, the component will think of it as pre-computed data (instead of raw data).
          const elementObj = Array.isArray(element) ? {} : element;
          return (
            <MultiWayUnit
              key={i}
              id={i}
              data={element}
              xScale={xScale}
              yScale={yScale}
              colorScale={colorScale}
              isSelected={
                selectedIds.length === 0 || selectedIds.indexOf(i) > -1
              }
              width={width}
              height={height}
              // Pre-computed data will contain contents in derivedData, its keys can be direclty passed as props to children components.
              {...elementObj}
            />
          );
        })}
      </g>
    );
  };

  _renderLabel = () => {
    const {numDataPoints, width, id, isThumbnail} = this.props;

    return (
      <g id="patterns">
        <line
          strokeDasharray="5, 10"
          strokeWidth="1"
          stroke="#AAA"
          x1="0"
          y1="0"
          x2={width}
          y2="0"
        />
        <text
          x={width}
          dy="1em"
          fill="#000"
          fontSize={isThumbnail ? '0.7em' : '1em'}
          textAnchor="end"
          alignmentBaseline="hanging"
        >
          {`segment_${id}`}
        </text>

        {!isThumbnail && (
          <text
            x={width}
            dy="1em"
            y="1.5em"
            fill="#AAA"
            textAnchor="end"
            alignmentBaseline="hanging"
          >
            {`${numDataPoints} data points`}
          </text>
        )}
      </g>
    );
  };

  render() {
    const {x, y} = this.props;

    return (
      <g
        transform={`translate(${x}, ${y})`}
        style={{transition: '0.5s linear'}}
      >
        {this._renderMultiWayUnit()}
        {this._renderLabel()}
      </g>
    );
  }
}

export default withDerivedData(MultiWayGroup);
