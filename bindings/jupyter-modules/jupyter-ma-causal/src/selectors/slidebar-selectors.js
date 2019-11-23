import {createSelector} from 'reselect';
import {getColumnWidth, getColumnHeight} from './base-selectors';

export const getChartWidth = createSelector(
  getColumnWidth,
  width => width - 20
);

export const getChartHeight = createSelector(getColumnHeight, height => 50);
