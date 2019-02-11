// @noflow
import React, {PureComponent} from 'react';
import {pointsToPolyline} from './utils';

const HEADER_HEIGHT = 12;
const FOOTER_HEIGHT = 18;

class NumericalFeatureView extends PureComponent {
  static defaultProps = {
    id: 'default-numerical-feature-id',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    feature: null,
  };

  state = {
    hoveredId: null,
  };

  _updateHoverId = id => this.setState({hoveredId: id});

  _renderPatternDefs = () => {
    const {
      feature: {name, colors},
    } = this.props;

    const [colorT, colorC] = colors;
    // remove spaces in id
    const idName = name.replace(/\s+/g, '_');
    return (
      <g id="patterns">
        <defs>
          <pattern
            id={`${idName}-scanline-T`}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <svg width="5" height="5">
              <path d="M 0 5 L 5 0 Z" stroke={colorT} strokeWidth={1} />
            </svg>
          </pattern>
          <pattern
            id={`${idName}-scanline-C`}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <svg width="5" height="5">
              <path d="M 0 0 L 5 5 Z" stroke={colorC} strokeWidth={1} />
            </svg>
          </pattern>
        </defs>
      </g>
    );
  };

  _renderFeatureDistribution = () => {
    const {width, height} = this.props;
    const {
      feature: {name, distributionsNormalized, colors},
    } = this.props;

    const [T, C] = distributionsNormalized;
    const [colorT, colorC] = colors;

    // remove spaces in id
    const idName = name.replace(/\s+/g, '_');
    const dx = width / T.length;
    const dy = height - HEADER_HEIGHT - FOOTER_HEIGHT;

    const pointsT = pointsToPolyline(T, dx, dy);
    const pointsC = pointsToPolyline(C, dx, dy);

    return (
      <g transform={`translate(0, ${height - FOOTER_HEIGHT}) scale(1,-1)`}>
        <defs>
          <polygon id={`T-${idName}`} points={pointsT} />
          <polygon id={`C-${idName}`} points={pointsC} />
          <rect id={`M-${idName}`} width={width} height={height} />
          <mask id={`T-NOT-C-${idName}`}>
            <use href={`#T-${idName}`} fill="white" />
            <use href={`#C-${idName}`} fill="black" />
          </mask>
          <mask id={`C-NOT-T-${idName}`}>
            <use href={`#C-${idName}`} fill="white" />
            <use href={`#T-${idName}`} fill="black" />
          </mask>
        </defs>

        <use
          href={`#M-${idName}`}
          mask={`url(#T-NOT-C-${idName})`}
          fill={`url(#${idName}-scanline-T)`}
          opacity={0.8}
        />
        <use
          href={`#M-${idName}`}
          mask={`url(#C-NOT-T-${idName})`}
          fill={`url(#${idName}-scanline-C)`}
          opacity={0.8}
        />

        <g fill="none">
          <use href={`#M-${idName}`} />
          <polyline points={pointsC} stroke={colorC} strokeWidth={2} />
          <polyline points={pointsT} stroke={colorT} strokeWidth={2} />
        </g>
      </g>
    );
  };

  _renderFeatureLabel = () => {
    const {height} = this.props;
    const {
      feature: {name, divergence},
    } = this.props;

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

  _renderMasks = () => {
    const {width, height} = this.props;
    const {
      feature: {domain},
    } = this.props;

    // domain.length = distributions[0].length + 1
    const dx = width / (domain.length - 1);
    const dy = height - HEADER_HEIGHT - FOOTER_HEIGHT;

    const masks = Array.from(Array(domain.length - 1)).map((_, i) => {
      return (
        <rect
          key={i}
          x={dx * i}
          width={dx}
          height={dy}
          onMouseOver={() => this._updateHoverId(i)}
        />
      );
    });

    return (
      <g
        id="masks"
        fill="none"
        transform={`translate(0, ${HEADER_HEIGHT})`}
        onMouseOut={() => this._updateHoverId(null)}
        pointerEvents="all"
      >
        {masks}
      </g>
    );
  };

  _renderMarkers = () => {
    const {hoveredId} = this.state;
    if (!hoveredId) {
      return null;
    }

    const {width, height} = this.props;
    const {
      feature: {domain, distributions, distributionsNormalized, colors},
    } = this.props;

    const [colorT, colorC] = colors;
    const [T, C] = distributionsNormalized;

    const idx = Number(hoveredId);
    const x0 = (width / domain.length - 1) * idx;
    const dy = height - HEADER_HEIGHT - FOOTER_HEIGHT;
    const yTreatment = (1 - T[idx]) * dy;
    const yControl = (1 - C[idx]) * dy;

    return (
      <g id="markers" transform={`translate(${x0}, ${HEADER_HEIGHT})`}>
        <circle cy={yTreatment} r={3} fill="#FFF" stroke={colorT} />
        <circle cy={yControl} r={3} fill="#FFF" stroke={colorC} />
        <text x={50} fill={colorC}>
          {distributions[1][idx].toFixed(2)}
        </text>
        <text x={100} fill={colorT}>
          {distributions[0][idx].toFixed(2)}
        </text>
        <text fill="#333">{domain[idx].toFixed(2)}</text>
      </g>
    );
  };

  render = () => {
    const {x, y, width, height, feature} = this.props;
    if (width <= 0 || height <= 0 || !feature) {
      return null;
    }

    return (
      <svg x={x} y={y} width={width} height={height}>
        {this._renderPatternDefs()}
        {this._renderFeatureLabel()}
        {this._renderFeatureDistribution()}
        {this._renderMasks()}
        {this._renderMarkers()}
      </svg>
    );
  };
}

export default NumericalFeatureView;
