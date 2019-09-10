// @noflow
import React, {PureComponent} from 'react';
import {Axis, axisPropsFromTickScale} from 'react-d3-axis';
import numeral from 'numeral';

import CategoricalFeatureView from './categorical-feature-view';
import NumericalFeatureView from './numerical-feature-view';
import {withDerivedData} from './utils';
import {FEATURE_TYPE} from '@mlvis/mlvis-common/constants';
import {
  CHART_PROP_TYPES,
  CHART_DEFAULT_PROPS,
  CHAR_WIDTH,
  CHAR_SEPARATION,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  RIGHT_MARGIN_WIDTH,
} from './constants';

const AXES_MARGIN = 5;

// generic component for rendering features with unknown types
class FeatureView extends PureComponent {
  static propTypes = CHART_PROP_TYPES;

  static defaultProps = CHART_DEFAULT_PROPS;

  state = {
    hoveredId: undefined,
    isFocused: false,
  };

  _updateHoverId = id => this.setState({hoveredId: id});
  _toggleFocus = isFocused => this.setState({isFocused});

  _renderContent = layoutProps => {
    const {
      data: {type},
    } = this.props;
    const chartProps = {
      ...this.props,
      ...layoutProps,
    };
    switch (type) {
      case FEATURE_TYPE.CATEGORICAL:
        return <CategoricalFeatureView {...chartProps} />;
      case FEATURE_TYPE.NUMERICAL:
        return <NumericalFeatureView {...chartProps} />;
      case undefined:
        return <div />;
      default:
        return;
    }
  };

  _renderSelectedInstances = () => {
    const {
      height,
      selectedInstances,
      data: {name},
      xScale,
    } = this.props;

    if (!selectedInstances || !selectedInstances.length) {
      return null;
    }

    return (
      <g>
        {selectedInstances.map((instance, i) => {
          const featureVal = instance[name];
          return (
            <rect
              key={i}
              width={1}
              height={height - HEADER_HEIGHT - FOOTER_HEIGHT}
              x={xScale(featureVal)}
              y={HEADER_HEIGHT}
            />
          );
        })}
      </g>
    );
  };

  _renderMasks = ({x, y, width, height}) => {
    const {
      data: {domain, type},
    } = this.props;

    // for numerical features, domain.length === distributions.length - 1
    const numMasks =
      type === FEATURE_TYPE.NUMERICAL ? domain.length - 1 : domain.length;
    const dx = width / numMasks;

    const masks = Array.from(Array(numMasks)).map((_, i) => {
      return (
        <rect
          key={i}
          x={dx * i}
          width={dx}
          height={height}
          onMouseOver={() => this._updateHoverId(i)}
        />
      );
    });

    return (
      <g
        id="masks"
        fill="none"
        transform={`translate(0, ${y})`}
        onMouseOut={() => this._updateHoverId(undefined)}
        pointerEvents="all"
      >
        {masks}
      </g>
    );
  };

  _renderMarkers = ({x, y, width, height}) => {
    const {hoveredId} = this.state;
    if (isNaN(hoveredId)) {
      return null;
    }

    const {
      data: {
        type,
        domain,
        distributions,
        distributionsNormalized,
        categoriesSortedOrder,
      },
      colors,
    } = this.props;

    // categorical feature categories are sorted by height difference
    const featureValId =
      type === FEATURE_TYPE.CATEGORICAL
        ? categoriesSortedOrder[hoveredId]
        : hoveredId;

    const [colorT, colorC] = colors;
    const [T, C] = distributionsNormalized;

    // for numerical features, domain.length === distributions.length - 1
    const numMasks =
      type === FEATURE_TYPE.NUMERICAL ? domain.length - 1 : domain.length;
    const dx = width / numMasks;
    const yTreatment = (1 - T[featureValId]) * height;
    const yControl = (1 - C[featureValId]) * height;

    const featureVal =
      type === FEATURE_TYPE.NUMERICAL
        ? numeral(domain[featureValId]).format('0,0.[00]')
        : String(domain[featureValId]);
    const count0 = numeral(distributions[0][featureValId]).format('0,0.[00]');
    const count1 = numeral(distributions[1][featureValId]).format('0,0.[00]');

    // categorical feature tooltips are positioned at center of bars
    const tooltipsOffset =
      type === FEATURE_TYPE.CATEGORICAL
        ? dx * (hoveredId + 0.5)
        : dx * hoveredId;

    const textOffset0 = CHAR_WIDTH * (featureVal.length + CHAR_SEPARATION);
    const textOffset1 =
      CHAR_WIDTH * (count0.length + CHAR_SEPARATION) + textOffset0;
    const textWidth =
      CHAR_WIDTH * (count1.length + CHAR_SEPARATION) + textOffset1;
    const allTextOffset = Math.min(tooltipsOffset, width - textWidth);

    return (
      <g id="markers">
        <g transform={`translate(${tooltipsOffset}, ${y})`}>
          <circle cy={yTreatment} r={3} fill="#FFF" stroke={colorT} />
          <circle cy={yControl} r={3} fill="#FFF" stroke={colorC} />
        </g>
        <g transform={`translate(${allTextOffset}, 2)`}>
          <text fill="#333" alignmentBaseline="hanging">
            {featureVal}
          </text>
          <text x={textOffset0} fill={colorT} alignmentBaseline="hanging">
            {count0}
          </text>
          <text x={textOffset1} fill={colorC} alignmentBaseline="hanging">
            {count1}
          </text>
        </g>
      </g>
    );
  };

  _renderFeatureLabel = () => {
    const {isFocused} = this.state;
    const {
      height,
      data: {type, name, divergence},
    } = this.props;
    if (isFocused && type !== FEATURE_TYPE.CATEGORICAL) {
      return null;
    }

    return (
      <text
        y={height - FOOTER_HEIGHT + 4}
        fill="#AAA"
        alignmentBaseline="hanging"
      >
        {`${Number.isFinite(divergence) ? divergence.toFixed(2) : ''} ${name}`}
      </text>
    );
  };

  _renderYAxis = () => {
    const {isFocused} = this.state;
    if (!isFocused) {
      return null;
    }
    const {
      width,
      height,
      colors,
      data: {distributionsMaxValues},
    } = this.props;
    const dy = height - HEADER_HEIGHT - FOOTER_HEIGHT;
    return (
      <g
        transform={`translate(${width -
          RIGHT_MARGIN_WIDTH +
          AXES_MARGIN}, ${HEADER_HEIGHT})`}
      >
        <line x1={0} y1={0} x2={0} y2={dy} stroke="#ccc" />
        <text
          fill={colors[0]}
          dx={4}
          dy={-2}
          fontSize={'0.7em'}
          alignmentBaseline="bottom"
        >
          {numeral(distributionsMaxValues[0]).format('0,0.[00]')}
        </text>
        <text
          fill={colors[1]}
          dx={4}
          dy={2}
          fontSize={'0.7em'}
          alignmentBaseline="hanging"
        >
          {numeral(distributionsMaxValues[1]).format('0,0.[00]')}
        </text>
        <text
          fill="#000"
          dx={4}
          y={dy}
          fontSize={'0.7em'}
          alignmentBaseline="bottom"
        >
          {0}
        </text>
      </g>
    );
  };

  _renderXAxis = () => {
    const {isFocused} = this.state;
    const {
      height,
      data: {type},
      xScale,
    } = this.props;
    if (!isFocused || type === FEATURE_TYPE.CATEGORICAL) {
      return null;
    }

    return (
      <g transform={`translate(0, ${height - FOOTER_HEIGHT + AXES_MARGIN})`}>
        <Axis
          {...axisPropsFromTickScale(xScale, 10)}
          style={{strokeColor: '#AAA', tickSizeInner: 0, strokeWidth: 0}}
        />
      </g>
    );
  };

  render() {
    const {x, y, width, height, data} = this.props;
    if (width <= 0 || height <= 0 || !data) {
      return null;
    }
    const innerLayourProps = {
      x: 0,
      y: HEADER_HEIGHT,
      width: width - RIGHT_MARGIN_WIDTH,
      height: height - HEADER_HEIGHT - FOOTER_HEIGHT,
    };
    return (
      <svg
        x={x}
        y={y}
        width={width + RIGHT_MARGIN_WIDTH}
        height={height}
        onMouseOver={() => this._toggleFocus(true)}
        onMouseOut={() => this._toggleFocus(false)}
      >
        {this._renderSelectedInstances()}
        {this._renderContent(innerLayourProps)}
        {this._renderMasks(innerLayourProps)}
        {this._renderMarkers(innerLayourProps)}
        {this._renderFeatureLabel()}
        {this._renderYAxis()}
        {this._renderXAxis()}
      </svg>
    );
  }
}

export default withDerivedData(FeatureView);
