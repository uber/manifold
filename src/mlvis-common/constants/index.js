import PropTypes from 'prop-types';

export const FEATURE_TYPE = {
  BOOLEAN: 'boolean',
  CATEGORICAL: 'categorical',
  NUMERICAL: 'numerical',
  GEO: 'geo',
};

export const FILTER_TYPE = {
  RANGE: 'range',
  INCLUDE: 'include',
  EXCLUDE: 'exclude',
  FUNC: 'func',
};

export const LAT_LNG_PAIRS = [
  ['lat', 'lng'],
  ['lat', 'lon'],
  ['latitude', 'longitude'],
];

export const START_END_PAIRS = [['start', 'end'], ['origin', 'destination']];

export const HEX_INDICATORS = ['hexagon', 'hexter'];

export const COLOR = {
  BLUE: '#1F6DF0',
  GREEN: '#47B274',
  ORANGE: '#F37C4B',
  PURPLE: '#6F5AA7',
};

// TODO (Lezhi): these props are used in MultiWayPlot now and APIs are pending discussion to be used as a generalized base API
export const CHART_PROP_TYPES = {
  /** x position of the chart as related to parent SVG */
  x: PropTypes.number,
  /** y position of the chart as related to parent SVG */
  y: PropTypes.number,
  /** width of the chart SVG, can be used to derive xScale.range if `getXRange` is not provided */
  width: PropTypes.number,
  /** height of the chart SVG, can be used to derive yScale.range if `getYRange` is not provided */
  height: PropTypes.number,
  /** padding between the chart content and the chart SVG,
   * can be used to derive xScale.range or yScale.range if `getXRange` or `getYRange` is not provided */
  padding: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
  }),

  // todo: use more specific data types
  data: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.object])
    ),
  ]),

  /** function to map data value to pixel value, similar concept as d3-scale.
   * If not provided, it will be derived using `getXScale`, `getXDomain`, etc.
   */
  xScale: PropTypes.func,
  /** function to map data value to pixel value, similar concept as d3-scale
   * If not provided, it will be derived using `getYScale`, `getYDomain`, etc.
   */
  yScale: PropTypes.func,
  /** function to map data value to color, similar concept as d3-scale */
  colorScale: PropTypes.func,

  // input of these `get...` functions are `data` array (not individual datum)
  /** function to get xScale. Input: none; output: `xScale` */
  getXScale: PropTypes.func,
  /** function to get xScale. Input: none; output: `yScale` */
  getYScale: PropTypes.func,
  /** function to get xScale. Input: `data`; output: `xScale.domain` */
  getXDomain: PropTypes.func,
  /** function to get xScale. Input: `data`; output: `yScale.domain` */
  getYDomain: PropTypes.func,
  /** function to get xScale. Input: `data`; output: `xScale.range`.
   * If not provided, `xScale.range` is automatically set to [0, `width` - `padding.left` - `padding.right`]
   */
  getXRange: PropTypes.func,
  /** function to get yScale. Input: `data`; output: `yScale.range`.
   * If not provided, `yScale.range` is automatically set to [`height` - `padding.top` - `padding.bottom`, 0]
   */
  getYRange: PropTypes.func,
};

export const CHART_DEFAULT_PROPS = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  data: [],

  colorScale: d => '#000',
};

export * from './data';
