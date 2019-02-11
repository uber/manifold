// @noflow
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
    return defaultColor;
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
