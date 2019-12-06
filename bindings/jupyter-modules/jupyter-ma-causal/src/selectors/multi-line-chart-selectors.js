import {createSelector} from 'reselect';
import {
  rootSelector,
  getColumnWidth,
  getChartPaddingLeft,
  getChartPaddingRight,
} from './base-selectors';

export const getChartWidth = createSelector(getColumnWidth, width => width);

export const getChartHeight = createSelector(rootSelector, height => 260);

export const getChartPadding = createSelector(
  [getChartPaddingLeft, getChartPaddingRight],
  (left, right) => ({top: 10, bottom: 20, left, right})
);
