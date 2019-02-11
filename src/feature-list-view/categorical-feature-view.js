// @noflow
import React, {PureComponent} from 'react';

const HEADER_HEIGHT = 12;
const FOOTER_HEIGHT = 18;

class CategoricalFeatureView extends PureComponent {
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
      feature: {name, domain, distributionsNormalized, colors},
    } = this.props;
    const {hoveredId} = this.state;

    const [T, C] = distributionsNormalized;
    const [colorT, colorC] = colors;

    const idName = name.replace(/\s+/g, '_');
    const dx = width / domain.length;
    const dy = height - HEADER_HEIGHT - FOOTER_HEIGHT;

    return Array.from(Array(domain.length))
      .map((_, i) => i)
      .sort((a, b) => {
        const deltaA = T[a] - C[a];
        const deltaB = T[b] - C[b];
        return deltaA > deltaB ? 1 : -1;
      })
      .map((index, i) => {
        const x0 = dx * i;
        return (
          <g key={i} transform={`translate(0, ${HEADER_HEIGHT})`}>
            <defs>
              <rect
                id={`T-${idName}-${i}`}
                x={dx >= 3 ? x0 + 1 : x0}
                y={dy - T[index] * dy}
                width={Math.max(dx - 2, 1)}
                height={T[index] * dy}
              />
              <rect
                id={`C-${idName}-${i}`}
                x={dx >= 3 ? x0 + 1 : x0}
                y={dy - C[index] * dy}
                width={Math.max(dx - 2, 1)}
                height={C[index] * dy}
              />
            </defs>
            {// make sure the smaller value goes to front
            T[index] > C[index] && (
              <use
                href={`#T-${idName}-${i}`}
                fill={`url(#${idName}-scanline-T)`}
                stroke={colorT}
                strokeWidth={2}
              />
            )}
            <use
              href={`#C-${idName}-${i}`}
              fill={`url(#${idName}-scanline-C)`}
              stroke={colorC}
              strokeWidth={2}
            />
            {T[index] <= C[index] && (
              <use
                href={`#T-${idName}-${i}`}
                fill={`url(#${idName}-scanline-T)`}
                stroke={colorT}
                strokeWidth={2}
              />
            )}
            {hoveredId === i && (
              <text dy={-3} fill="#333">
                {domain[index]}
              </text>
            )}
          </g>
        );
      });
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
        fontSize={12}
        fontWeight={800}
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

    const dx = width / domain.length;
    const dy = height - HEADER_HEIGHT - FOOTER_HEIGHT;

    const masks = Array.from(Array(domain.length)).map((_, i) => {
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
      </svg>
    );
  };
}

export default CategoricalFeatureView;
