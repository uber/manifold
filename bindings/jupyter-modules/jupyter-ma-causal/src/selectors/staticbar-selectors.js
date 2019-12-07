import {createSelector} from 'reselect';
import {
  rootSelector,
  getColumnWidth,
  getChartPaddingLeft,
  getChartPaddingRight,
} from './base-selectors';

export const getChartWidth = createSelector(getColumnWidth, width => width);

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getChartHeight = createSelector(rootSelector, height => 50);

export const getChartPadding = createSelector(
  [getChartPaddingLeft, getChartPaddingRight],
  (left, right) => ({bottom: 0, top: 0, left, right})
);
