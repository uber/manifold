import React from 'react';
import {shallow} from 'enzyme';

import {withXYScales} from '../utils';
import {CHART_DEFAULT_PROPS} from '../constants';

test('utils: decorators/withXYScales, single component functionality', () => {
  const width = 500;
  const dataObj1 = {a: 1};
  const createdXScale = {
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  };
  const getXDomain = jest.fn(() => 'something');
  const getXScale = jest.fn(() => createdXScale);
  const yScale = 'mockYScale';

  const inputProps1 = {
    ...CHART_DEFAULT_PROPS,
    randomProp: 'random',
    width,
    data: dataObj1,
    // use derived xScale
    getXDomain,
    getXScale,
    // use pre-computed yScale
    yScale,
  };

  const TestComponent = () => <div />;
  const TestHoc1 = withXYScales(TestComponent);
  const wrapper1 = shallow(<TestHoc1 {...inputProps1} />);

  // test creating a scale when scale is not given
  expect(wrapper1.props().xScale).toBe(createdXScale);
  // test passing on the scal when scale is given
  expect(wrapper1.props().yScale).toBe(yScale);

  // test `getXDomain` and `getXScale` are called once
  expect(getXDomain.mock.calls.length).toBe(1);
  expect(getXScale.mock.calls.length).toBe(1);
  // test xRange is derived based on `width` when `getXRange` is not provided
  expect(createdXScale.range.mock.calls[0][0]).toEqual([0, width]);

  // `getXDomain` and `getXScale` should not recompute if `data` doesn't change
  wrapper1.setProps({randomProp: 'random random'});
  expect(getXDomain.mock.calls.length).toBe(1);
  expect(getXScale.mock.calls.length).toBe(1);

  // should not recompute if `data` is the same object
  dataObj1.a = 2;
  expect(getXDomain.mock.calls.length).toBe(1);
  expect(getXScale.mock.calls.length).toBe(1);

  // should only recompute if `data` prop mutates
  wrapper1.setProps({data: {a: 3}});
  expect(getXDomain.mock.calls.length).toBe(2);
  expect(getXScale.mock.calls.length).toBe(2);
});

test('utils: decorators/withXYScales, two components', () => {
  const dataObj1 = {a: 1};
  const getXScale = jest.fn(() => ({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  }));

  const inputProps1 = {
    ...CHART_DEFAULT_PROPS,
    data: dataObj1,
    getXDomain: () => 'something',
    getXScale,
    yScale: 'mockYScale',
  };

  const TestComponent = () => <div />;
  const TestHoc1 = withXYScales(TestComponent);
  shallow(<TestHoc1 {...inputProps1} />);

  // test `getXDomain` and `getXScale` are called once
  expect(getXScale.mock.calls.length).toBe(1);

  // should not recompute if `data` is the same object
  dataObj1.a = 2;
  expect(getXScale.mock.calls.length).toBe(1);

  // a different HOC
  // exactly same props as `TestHoc1`
  const inputProps2 = {
    ...CHART_DEFAULT_PROPS,
    data: dataObj1,
    getXDomain: () => 'something',
    getXScale,
    yScale: 'mockYScale',
  };

  const TestHoc2 = withXYScales(TestComponent);
  shallow(<TestHoc2 {...inputProps2} />);

  // `getXDomain` and `getXScale` should recompute for the second HOC even if `data` stays the same
  expect(getXScale.mock.calls.length).toBe(2);
});
