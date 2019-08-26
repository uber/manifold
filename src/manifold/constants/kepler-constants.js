import {interpolateRgb} from 'd3-interpolate';
import {color} from 'd3-color';
import {dotRange} from 'packages/mlvis-common/utils';

export const FILTER_TYPES = {
  range: 'range',
  select: 'select',
  timeRange: 'timeRange',
  multiSelect: 'multiSelect',
};

export const LAYER_TYPES = {
  point: 'point',
  arc: 'arc',
  line: 'line',
  grid: 'grid',
  hexagon: 'hexagon',
  geojson: 'geojson',
  cluster: 'cluster',
  icon: 'icon',
  heatmap: 'heatmap',
  hexagonId: 'hexagonId',
  '3D': '3D',
};

export const KEPLER_GL_VERSION = 'v1';

export const KEPLER_DATASET_NAME = 'kepler_data';

const colorInterpolatorPink = interpolateRgb('#fff', '#ff0099');
const colorInterpolatorGrey = interpolateRgb('#fff', '#818c81');

export const HEATMAP_COLORS = [
  dotRange(1, 10).map(d => color(colorInterpolatorPink(0.1 * d)).formatHex()),
  dotRange(1, 10).map(d => color(colorInterpolatorGrey(0.1 * d)).formatHex()),
];

export const DIVERGING_COLORS = HEATMAP_COLORS[1]
  .slice(1)
  .reverse()
  .concat(HEATMAP_COLORS[0].slice(1));
