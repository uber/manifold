import {createSelector} from 'reselect';
import {getColumnWidth, getColumnHeight} from './base-selectors';

export const getChartWidth = createSelector(
  getColumnWidth,
  width => width - 20
);

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getChartHeight = createSelector(getColumnHeight, height => 50);
