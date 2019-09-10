import {
  formatNumber,
  generateRandomPoints,
  generateRandomSteps,
  discrete,
} from '../utils';

test('generateRandomPoints(k) should return k random numbers', async () => {
  const points = generateRandomPoints(7);
  expect(points).toHaveLength(7);
});

test('generateRandomSteps(k) should return steps of length k+1', async () => {
  const steps = generateRandomSteps(5);
  expect(steps).toHaveLength(6);
});

test('generateRandomSteps(k) should start with zero and end with one', async () => {
  const steps = generateRandomSteps(5);
  expect(steps[0]).toEqual(0);
  expect(steps[steps.length - 1]).toEqual(1);
});

test('generateRandomSteps(k) should return steps in ascending order', async () => {
  const steps = generateRandomSteps(5);
  expect(steps.sort()).toEqual(steps);
});

test('discrete(values) truthy tests', async () => {
  expect(discrete(['0', '1', '2'])).toBeTruthy();
  expect(discrete(['1.0', '2.0'])).toBeTruthy();
  expect(discrete(['1.5', 'a'])).toBeTruthy();
  expect(discrete(['1.0', 2.5])).toBeTruthy();
  expect(discrete([0, 1, 2])).toBeFalsy();
  expect(discrete([0, 1, 2, Infinity])).toBeFalsy();
  expect(discrete([0, 1.5, 2])).toBeFalsy();
});

test('formatNumber', () => {
  expect(formatNumber()).toEqual('');
  expect(formatNumber(null)).toEqual('');
  expect(formatNumber(undefined)).toEqual('');
  expect(formatNumber(NaN)).toEqual('NaN');
  expect(formatNumber('NaN')).toEqual('NaN');

  expect(formatNumber(0)).toEqual('0');
  expect(formatNumber(12345)).toEqual('12,345');
  expect(formatNumber(1234567)).toEqual('1,234,567');
  expect(formatNumber(123456789)).toEqual('1.235e+8');
  expect(formatNumber(1234567.89)).toEqual('1,234,567.89');

  expect(formatNumber(0.12345)).toEqual('0.123');
  expect(formatNumber(0.0012345)).toEqual('0.001');
  expect(formatNumber(0.00000000012345)).toEqual('0');

  // as percents
  expect(formatNumber(null, true)).toEqual('');
  expect(formatNumber(undefined, true)).toEqual('');
  expect(formatNumber(NaN, true)).toEqual('NaN');
  expect(formatNumber('NaN', true)).toEqual('NaN');
  expect(formatNumber(0, true)).toEqual('0%');
  expect(formatNumber(0.12345, true)).toEqual('12.345%');
  expect(formatNumber(0.0012345, true)).toEqual('0.123%');
  expect(formatNumber(12345, true)).toEqual('1,234,500%');
  expect(formatNumber(123456789, true)).toEqual('1.235e+10%');
});
