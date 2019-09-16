import {
  extractHourAndValue,
  extractValueRange,
  createHourlyValueMap,
  // TODO add unit tests for the three functions below
  // createHourlyValueDistribution,
  // withDerivedLayout,
  // withDerivedData,
} from '../utils';

test('utils: extractHourAndValue', () => {
  const data = [
    {order_time: 0, metric: 0.0, count: 100},
    {order_time: 1, metric: 0.5, count: 200},
    {order_time: 2, metric: 1.0, count: 300},
  ];
  const output = [
    {hour: 0, value: 0.0},
    {hour: 1, value: 0.5},
    {hour: 2, value: 1.0},
  ];
  expect(extractHourAndValue(data, d => d.order_time, d => d.metric)).toEqual(
    output
  );
});

test('utils: extractValueRange', () => {
  const data = [
    {hour: 0, value: 0.1},
    {hour: 1, value: 0.5},
    {hour: 2, value: 0.9},
  ];
  expect(extractValueRange([])).toEqual([0, 1]);
  expect(extractValueRange(data)).toEqual([0.1, 0.9]);
});

test('utils: createHourlyValueMap', () => {
  const data = [
    {hour: 0, value: 0.1},
    {hour: 0, value: 0.2},
    {hour: 1, value: 0.5},
    {hour: 2, value: 0.6},
    {hour: 3, value: 1.0},
    {hour: 3, value: 0.8},
  ];
  const output = {
    0: [0.1, 0.2],
    1: [0.5],
    2: [0.6],
    3: [1.0, 0.8],
  };
  expect(createHourlyValueMap([])).toEqual({});
  expect(createHourlyValueMap(data)).toEqual(output);
});

test('utils: createHourlyValueDistribution', () => {
  // TODO
});

test('utils: withDerivedLayout', () => {
  // TODO
});

test('utils: withDerivedData', () => {
  // TODO
});
