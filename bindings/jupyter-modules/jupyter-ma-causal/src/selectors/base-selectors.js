import {createSelector} from 'reselect';

export const rootSelector = state => state;

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getColumnWidth = createSelector(rootSelector, () => 300);

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getChartPaddingLeft = createSelector(rootSelector, () => 30);

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getChartPaddingRight = createSelector(rootSelector, () => 20);

export const getData = createSelector(rootSelector, state => state.data);

export const getSliderValues = createSelector(
  rootSelector,
  state => state.sliderValues
);
