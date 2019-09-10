import {createMemoizedSelectorFactory} from '../utils/selectors';

test('utils: createMemoizedSelectorFactory', () => {
  const resultFunc = jest.fn((a, b) => a + b + 1);
  const selectorFacrory1 = createMemoizedSelectorFactory(
    [props => props, props => props + 2],
    resultFunc
  );
  const selector = selectorFacrory1('id1');
  const memoizedSelector = selectorFacrory1('id1');
  const selectorVersion2 = selectorFacrory1('id2');

  // testing the selectors are being properly momoized
  expect(selector).toBe(memoizedSelector);
  expect(selector).not.toBe(selectorVersion2);

  // testing the selector result
  expect(selector(9)).toBe(21);
  expect(resultFunc.mock.calls.length).toBe(1);

  // testing single selector memoization
  selector(9);
  expect(resultFunc.mock.calls.length).toBe(1);

  // `memoizedSelector` should remember the input to `selector` and should not recompute
  memoizedSelector(9);
  expect(resultFunc.mock.calls.length).toBe(1);

  // `memoizedSelector` should only recompute if the input changes
  memoizedSelector(1);
  expect(resultFunc.mock.calls.length).toBe(2);

  // `selectorVersion2` shouldn't remember the input to `selector` and should recompute
  selectorVersion2(9);
  expect(resultFunc.mock.calls.length).toBe(3);
});
