// @noflow

/**
 * generate one random ID, unique for single client
 *
 * @param {Number} seed: random seed, use Date.now() by default
 * @return a unique ID string
 */
export const generateRandomId = (seed = Date.now()) =>
  (seed * Math.random()).toString(36).substr(2, 6);

/**
 * generate n random points with position x and y in [0, 1]
 *
 * @param {Number} n: number of points
 * @return a list of randomly positioned points
 */
export const generateRandomPoints = n =>
  Array(n)
    .fill(0)
    .map(_ => ({x: Math.random(), y: Math.random()}));

/**
 * generate k random steps within the domain of [0, 1]
 *
 * @param {Number} k: number of steps
 * @return a list of krandom steps of length k + 1 [0, 0.25, 0.34, 0.78, ..., 1]
 */
export const generateRandomSteps = k =>
  Array(k)
    .fill(0)
    .map(_ => Math.random() / 2)
    .reduce((acc, val, idx) => [...acc, acc[idx] + (1 - acc[idx]) * val], [0])
    .slice(0, -1)
    .concat([1]);

/**
 * check if the given array of values is discrete or not
 *
 * @param {[]} values: array of values, can be numbers or strings
 * @return {Boolean}: whether the input array is discrete
 */
export const discrete = values =>
  values.some(isNaN) || values.map(Number).every(Number.isInteger);

export * from './color';
export * from './feature';
export * from './computation';
