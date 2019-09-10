import {interpolatePuBu} from 'd3-scale-chromatic';

const DEFAULT_COLOR = [255, 128, 128];

const clampValue = (min, max) => value =>
  value < min ? min : value > max ? max : value;

/**
 * map an input value to a given color scale, and return a color hex string
 *
 * @param {Number} value: input value
 * @param {Boolean} clamp: whether to clamp the input value to [0, 1], default yes
 * @param {[Number]} defaultColor: fallback color
 * @return interpolated color in hex string format #1234FF
 */
export const interpolateColorToHex = ({
  value,
  clamp = true,
  defaultColor = DEFAULT_COLOR,
  interpolator = interpolatePuBu,
}) => {
  const newValue = clamp ? clampValue(0, 1)(value) : value;

  if (!Number.isFinite(newValue)) {
    // [r, g, b] => `rgb(r, g, b)`
    return `rgb(${defaultColor.join(', ')})`;
  }

  return interpolator(newValue);
};

/**
 * map an input value to a given color scale, and return a rgb array
 *
 * @param {Number} value: intpu value
 * @param {Boolean} clamp: whether to clamp the input value to [0, 1], default yes
 * @param {[Number]} defaultColor: fallback color
 * @return interpolated color in [255, 255, 255] format
 */
export const interpolateColor = ({
  value,
  clamp = true,
  defaultColor = DEFAULT_COLOR,
  interpolator = interpolatePuBu,
}) => {
  return interpolateColorToHex({value, clamp, defaultColor, interpolator})
    .match(/[0-9]+/g)
    .map(n => Number(n));
};

export function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha || alpha === 0) {
    const _alpha = Math.max(Math.min(alpha, 1), 0);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + _alpha + ')';
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}
