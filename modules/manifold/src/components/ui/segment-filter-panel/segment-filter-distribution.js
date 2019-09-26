// not used for now, draws distribution histogram of features
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {FEATURE_TYPE} from '@mlvis/mlvis-common/constants';

// TODO make responsive
const DEFAULT_WIDTH = 192;
const DEFAULT_HEIGHT = 40;
const COLOR = {
  INCLUDE: '#1690FF',
  EXCLUDE: '#CCC',
};

const getColor = (value, domain, type) => {
  if (!domain || !domain.length) {
    return COLOR.INCLUDE;
  }
  switch (type) {
    case FEATURE_TYPE.NUMERICAL:
      return domain[0] <= value && value <= domain[1]
        ? COLOR.INCLUDE
        : COLOR.EXCLUDE;
    case FEATURE_TYPE.CATEGORICAL:
      return domain.includes(value) ? COLOR.INCLUDE : COLOR.EXCLUDE;
    default:
      return COLOR.INCLUDE;
  }
};

export default class SegmentFilterDistribution extends PureComponent {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    attribute: PropTypes.shape({
      key: PropTypes.string.isRequired,
      distribution: PropTypes.arrayOf(PropTypes.number),
      domain: PropTypes.arrayOf(PropTypes.any),
      type: PropTypes.string.isRequired,
    }).isRequired,
    // an alternative domain used for highlighting
    domainAlt: PropTypes.arrayOf(PropTypes.any),
  };

  static defaultProps = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    attribute: null,
  };

  _renderDistribution = () => {
    const {width, height, attribute, domainAlt} = this.props;
    if (!attribute) {
      return null;
    }

    const {domain, distribution, type} = attribute;
    // TODO use domain and distribution to generate hovered tooltip

    const dx = width / domain.length;
    const dy = height;

    const maxValue = Math.max(...distribution);
    const normalizedDistribution = distribution.map(d => d / maxValue);

    const rects = normalizedDistribution.map((d, i) => {
      const color = getColor(domain[i], domainAlt, type);
      return (
        <rect
          key={i}
          x={dx * i}
          rx={2}
          ry={2}
          width={dx}
          height={dy * d}
          fill={color}
        />
      );
    });

    return <g transform={`translate(0, ${height}) scale(1,-1)`}>{rects}</g>;
  };

  render() {
    const {width, height} = this.props;
    if (width <= 0 || height <= 0) {
      return null;
    }

    return (
      <svg width={width} height={height}>
        {this._renderDistribution()}
      </svg>
    );
  }
}
