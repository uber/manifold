// @noflow
import React, {PureComponent} from 'react';
import {pointsToPolyline} from './utils';
import {CHART_PROP_TYPES, CHART_DEFAULT_PROPS} from './constants';

class NumericalFeatureView extends PureComponent {
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
    const {width, height} = this.props;
    const {
      data: {name, distributionsNormalized},
      colors,
    } = this.props;

    const [T, C] = distributionsNormalized;
    const [colorT, colorC] = colors;

    // remove spaces in id
    const idName = name.replace(/\s+/g, '_');
    const dx = width / T.length;

    const pointsT = pointsToPolyline(T, dx, height);
    const pointsC = pointsToPolyline(C, dx, height);

    return (
      <g transform={`translate(0, ${height}) scale(1,-1)`}>
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

export default NumericalFeatureView;
