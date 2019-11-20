import {createSelector} from 'reselect';

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
