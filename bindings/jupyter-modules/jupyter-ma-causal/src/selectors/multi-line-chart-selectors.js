import {createSelector} from 'reselect';
import {
  getColumnWidth,
  getColumnHeight,
  getChartPaddingLeft,
  getChartPaddingRight,
} from './base-selectors';

export const getChartWidth = createSelector(
  getColumnWidth,
  width => width - 20
);

export const getChartHeight = createSelector(getColumnHeight, height =>
  Math.min(260, (height - 50) / 2)
);

export const getChartPadding = createSelector(
  [getChartPaddingLeft, getChartPaddingRight],
  (left, right) => ({top: 10, bottom: 20, left, right})
);
