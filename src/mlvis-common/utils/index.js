// @noflow

/**
 * check if the given array of values is discrete or not
 *
 * @param {[]} values: array of values, can be numbers or strings
 * @return {Boolean}: whether the input array is discrete
 */
export const discrete = values => {
  const isNumeric = n =>
    !Number.isNaN(n) && (Number.isFinite(n) || Math.abs(n) === Infinity);

  return !values.every(isNumeric);
};

// 12345 => 12,345
// 123456789 => 1.235e+8
// 0.123456789 => 0.123
// 0.0012345 => 0.001
// 0.0000005 => 0
export const formatNumber = (n, asPercent) => {
  if (n === null || n === undefined) {
    return '';
  }
  if (Number.isNaN(n) || n === 'NaN') {
    return NaN.toLocaleString();
  }
  if (asPercent) {
    return `${formatNumber(n * 100, false)}%`;
  }
  const rounded = n - Math.floor(n) <= 1e-6 ? parseInt(Math.floor(n)) : n;
  if (rounded === 0) {
    return '0';
  }

  if (Math.abs(rounded) > 1e8 || Math.abs(rounded) < 1e-3) {
    return rounded.toExponential(3).toLocaleString();
  }
  return rounded.toLocaleString();
};

export * from './color';
export * from './computation';
export * from './gen-data';
export * from './gen-feature';
export * from './io';
export * from './kmeans';
export * from './decorators';
