// @noflow
import {generateRandomPoints, generateRandomSteps, discrete} from '../utils';

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
  expect(discrete([0, 1, 2])).toBeTruthy();
  expect(discrete(['1.0', '2.0'])).toBeTruthy();
  expect(discrete(['1.0', 2.0])).toBeTruthy();
  expect(discrete(['1.5', 'a'])).toBeTruthy();

  expect(discrete([0, 1, 2, Infinity])).toBeFalsy();
  expect(discrete([0, 1.5, 2])).toBeFalsy();
  expect(discrete(['1.0', 2.5])).toBeFalsy();
});
