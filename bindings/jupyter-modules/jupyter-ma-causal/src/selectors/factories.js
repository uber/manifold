import {createSelector} from 'reselect';
import {getData, getSliderValues} from './base-selectors';
import {extent as d3Extent} from 'd3-array';

export const getColumnDataFactory = index =>
  createSelector(getData, data => data[index]);

export const getSliderValueFactory = index =>
  createSelector(getSliderValues, sliderValues => sliderValues[index]);

// Due to the nature of being a prototype, the component gets the entire column
// data and process it by itself to avoid nested structures which are hard to
// modify later. Once the data format is finalized, these code can be easily changed
// to make it more efficent and elegant.
// TODO: refactor these data related code once the input format is finalized
export const getLineDataFactory = (index, lineName) =>
  createSelector(getData, data =>
    data[index].lines
      .find(d => d.name === lineName)
      .line.map(d => ({...d}))
      .sort((a, b) => a.x - b.x)
  );

export const getLineDataYDomainFactory = getLineData =>
  createSelector(getLineData, data => d3Extent(data, d => d.y));
