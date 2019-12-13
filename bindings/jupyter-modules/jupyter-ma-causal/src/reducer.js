import {handleActions} from 'redux-actions';

import {UPDATE_DATA, UPDATE_SLIDER_VALUES} from './actions';

const DEFAULT_STATE = {
  containerWidth: 800,
  containerHeight: 800,
  data: [],
  sliderValues: [], // associative array
};

const handleUpdateData = (state, {payload}) => {
  return {
    ...state,
    data: payload,
  };
};

/**
 * @params payload - {[idx]: value, ...}
 */
const handleUpdateSliderValues = (state, {payload}) => ({
  ...state,
  sliderValues: Object.entries(payload).reduce((values, [index, value]) => {
    values[index] = value;
    return values;
  }, state.sliderValues.slice(0)),
});

export default handleActions(
  {
    [UPDATE_DATA]: handleUpdateData,
    [UPDATE_SLIDER_VALUES]: handleUpdateSliderValues,
  },
  DEFAULT_STATE
);
