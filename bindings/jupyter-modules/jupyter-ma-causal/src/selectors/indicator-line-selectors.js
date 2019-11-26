import {createSelector} from 'reselect';
import {
  getColumnWidth,
  getChartPaddingLeft,
  getChartPaddingRight,
} from './base-selectors';

export const getChartWidth = createSelector(getColumnWidth, width => width);

export const getChartPadding = createSelector(
  [getChartPaddingLeft, getChartPaddingRight],
  (left, right) => ({bottom: 15, top: 10, left, right})
);
