// @noflow
import memoize from 'lodash.memoize';
import {createSelector} from 'reselect';

const getData = props => props.data;
const innerWidthSelector = props =>
  props.width - props.padding.left - props.padding.right;
const innerHeightSelector = props => {
  return props.height - props.padding.top - props.padding.bottom;
};

/*
 * Function to create a selector factory.
 * @params ...funcs - same signature as the inputs of `createSelector` in "reselect"
 * @returns {Function} - a factory function: input: selectorId; output: selector
 * Given the same selectorId, the factory will retrun the same selector object
 * Used for applyting the same selector logic to different components (which have different sets of props)
 */
export const createMemoizedSelectorFactory = (...funcs) =>
  memoize(selectorId => createSelector(...funcs));

const xDomainSelectorFactory = createMemoizedSelectorFactory(
  [getData, props => props.xDomain, props => props.getXDomain],
  (data, xDomain, getXDomain) =>
    xDomain ? xDomain : getXDomain ? getXDomain(data) : undefined
);

const yDomainSelectorFactory = createMemoizedSelectorFactory(
  [getData, props => props.yDomain, props => props.getYDomain],
  (data, yDomain, getYDomain) =>
    yDomain ? yDomain : getYDomain ? getYDomain(data) : undefined
);

const xRangeSelectorFactory = createMemoizedSelectorFactory(
  getData,
  props => props.xRange,
  props => props.getXRange,
  innerWidthSelector,
  (data, xRange, getXRange, innerWidth) =>
    xRange ? xRange : getXRange ? getXRange(data) : [0, innerWidth]
);

const yRangeSelectorFactory = createMemoizedSelectorFactory(
  getData,
  props => props.yRange,
  props => props.getYRange,
  innerHeightSelector,
  (data, yRange, getYRange, innerHeight) =>
    yRange ? yRange : getYRange ? getYRange(data) : [innerHeight, 0]
);

// todo: figure out a way to pass `selectorId` to input functions, and wrap function with `createMemoizedSelectorFactory`
export const xScaleSelectorFactory = memoize(selectorId =>
  createSelector(
    props => props.xScale,
    props => props.getXScale,
    xDomainSelectorFactory(selectorId),
    xRangeSelectorFactory(selectorId),
    (xScale, getXScale, xDomain, xRange) =>
      xScale
        ? xScale
        : getXScale
        ? getXScale()
            .domain(xDomain)
            .range(xRange)
        : undefined
  )
);
export const yScaleSelectorFactory = memoize(selectorId =>
  createSelector(
    props => props.yScale,
    props => props.getYScale,
    yDomainSelectorFactory(selectorId),
    yRangeSelectorFactory(selectorId),
    (yScale, getYScale, yDomain, yRange) =>
      yScale
        ? yScale
        : getYScale
        ? getYScale()
            .domain(yDomain)
            .range(yRange)
        : undefined
  )
);
