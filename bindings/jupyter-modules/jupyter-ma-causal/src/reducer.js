import {handleActions} from 'redux-actions';
import {scaleLinear} from 'd3-scale';
import {extent as d3Extent} from 'd3-array';

import {UPDATE_DATA, UPDATE_SLIDER_VALUES} from './actions';

const DEFAULT_STATE = {
  containerWidth: 800,
  containerHeight: 800,
  data: [],
  sliderValues: [],
};

const handleUpdateData = (state, {payload}) => {
  // temporary hack to scale the data until the actual scale method is implemented
  payload.forEach(d => {
    d.lines.forEach(({name, line}) => {
      if (name === 'ipvu') {
        const extent = d3Extent(line, d => d.y);
        const scale = scaleLinear()
          .domain(extent)
          .range([0, 1]);
        line.forEach(d => {
          d.y = scale(d.y);
        });
      }
    });
  });

  return {
    ...state,
    data: payload,
  };
};

/**
 * @params payload - {[idx]: value, ...}
 */
const handleUpdateSliderValues = (state, {payload}) => {
  return {
    ...state,
    sliderValues: state.sliderValues.map(
      (d, i) => (payload.hasOwnProperty(i) ? payload[i] : d)
    ),
  };
};

export default handleActions(
  {
    [UPDATE_DATA]: handleUpdateData,
    [UPDATE_SLIDER_VALUES]: handleUpdateSliderValues,
  },
  DEFAULT_STATE
);
