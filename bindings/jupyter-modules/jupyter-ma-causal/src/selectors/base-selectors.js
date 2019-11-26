import {createSelector} from 'reselect';
import {CONTAINER_PADDING} from '../constants';

export const rootSelector = state => state;

export const getContainerWidth = createSelector(
  rootSelector,
  state => state.containerWidth
);

export const getContainerHeight = createSelector(
  rootSelector,
  state => state.containerHeight
);

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getColumnWidth = createSelector(rootSelector, () => 300);

export const getColumnHeight = createSelector(
  getContainerHeight,
  height => height - CONTAINER_PADDING.TOP - CONTAINER_PADDING.BOTTOM
);

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getChartPaddingLeft = createSelector(rootSelector, () => 20);

// TODO: move this to a constant or implement adjustable width logic depending on the needs
export const getChartPaddingRight = createSelector(rootSelector, () => 10);

export const getData = createSelector(rootSelector, state => state.data);

export const getSliderValues = createSelector(
  rootSelector,
  state => state.sliderValues
);
