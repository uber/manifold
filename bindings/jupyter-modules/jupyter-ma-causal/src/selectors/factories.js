import {createSelector} from 'reselect';
import {getData, getSliderValues} from './base-selectors';

export const getColumnDataFactory = index =>
  createSelector(getData, data => data[index]);

export const getSliderValueFactory = index =>
  createSelector(getSliderValues, sliderValues => sliderValues[index]);
