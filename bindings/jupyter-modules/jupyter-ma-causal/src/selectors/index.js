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

export const getData = createSelector(rootSelector, state => state.data);

export const getColumnWidth = createSelector(rootSelector, () => 200);

export const getColumnHeight = createSelector(
  getContainerHeight,
  height => height - CONTAINER_PADDING.TOP - CONTAINER_PADDING.BOTTOM
);
