// @noflow
import React, {PureComponent} from 'react';
import {CHART_PROP_TYPES, CHART_DEFAULT_PROPS} from './constants';

class CategoricalFeatureView extends PureComponent {
  static propTypes = CHART_PROP_TYPES;

  static defaultProps = CHART_DEFAULT_PROPS;

  _renderPatternDefs = () => {
    const {
      data: {name},
      colors,
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
    const {
      width,
      height,
      data: {name, distributionsNormalized, categoriesSortedOrder},
      colors,
    } = this.props;

    const [T, C] = distributionsNormalized;
    const [colorT, colorC] = colors;

    const idName = name.replace(/\s+/g, '_');
    const dx = width / T.length;

    return categoriesSortedOrder.map((index, i) => {
      const x0 = dx * i;
      return (
        <g key={i}>
          <defs>
            <rect
              id={`T-${idName}-${i}`}
              x={dx >= 3 ? x0 + 1 : x0}
              y={height - T[index] * height}
              width={Math.max(dx - 2, 1)}
              height={T[index] * height}
            />
            <rect
              id={`C-${idName}-${i}`}
              x={dx >= 3 ? x0 + 1 : x0}
              y={height - C[index] * height}
              width={Math.max(dx - 2, 1)}
              height={C[index] * height}
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
        </g>
      );
    });
  };

  render() {
    const {x, y} = this.props;

    return (
      <g transform={`translate(${x}, ${y})`}>
        {this._renderPatternDefs()}
        {this._renderFeatureDistribution()}
      </g>
    );
  }
}

export default CategoricalFeatureView;
