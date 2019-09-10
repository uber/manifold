// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {area} from 'd3-shape';
import {dotRange} from '@mlvis/mlvis-common/utils';
import {withDerivedDataUnit as withDerivedData} from './utils';

import {
  CHART_DEFAULT_PROPS,
  CHART_PROP_TYPES,
} from '@mlvis/mlvis-common/constants';

class MultiWayUnit extends PureComponent {
  static propTypes = {
    ...CHART_PROP_TYPES,
    density: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    percentiles: PropTypes.arrayOf(PropTypes.number),
    isSelected: PropTypes.bool,
  };

  static defaultProps = {
    ...CHART_DEFAULT_PROPS,
    isSelected: true,
  };

  _renderDistribution = () => {
    const {id, density, xScale, yScale, colorScale, isSelected} = this.props;
    const [values, domain] = density;

    const areaFunc = area()
      .x(i => xScale(domain[i]))
      .y0(i => yScale(values[i]))
      .y1(i => -1 * yScale(values[i]));
    const arrRange = dotRange(values.length);

    return (
      <g transform={`translate(0, 0) scale(1,-1)`}>
        <path
          d={areaFunc(arrRange)}
          stroke={colorScale(id)}
          strokeWidth={2}
          strokeOpacity={isSelected ? 1 : 0}
          fillOpacity={0}
        />
      </g>
    );
  };

  _renderSummary = () => {
    const {id, xScale, percentiles, colorScale, isSelected} = this.props;

    return (
      <g id="summary" fill="none" pointerEvents="all">
        <rect
          key={0}
          x={xScale(percentiles[2])}
          y={-1}
          width={xScale(percentiles[4]) - xScale(percentiles[2])}
          height={2}
          fill={colorScale(id)}
          fillOpacity={isSelected ? 1 : 0}
        />
        <rect
          key={1}
          x={xScale(percentiles[3]) - 1}
          y={-5}
          width={2}
          height={10}
          fill={colorScale(id)}
          fillOpacity={isSelected ? 1 : 0}
        />
      </g>
    );
  };

  render() {
    const {x, y, percentiles, density} = this.props;

    if (!percentiles || !density) {
      return null;
    }

    return (
      <g transform={`translate(${x}, ${y})`}>
        {this._renderDistribution()}
        {this._renderSummary()}
      </g>
    );
  }
}

export default withDerivedData(MultiWayUnit);
