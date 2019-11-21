import {handleActions} from 'redux-actions';
import {scaleLinear} from 'd3-scale';
import {extent as d3Extent} from 'd3-array';

import {UPDATE_DATA} from './actions';

const DEFAULT_STATE = {
  containerWidth: 800,
  containerHeight: 800,
  data: null,
};

const handleUpdateData = (state, {payload}) => {
  if (!payload) {
    return {
      ...state,
      data: payload,
    };
  }

  // temporary hack to scale the data until the actual scale method is implemented
  payload.forEach(d => {
    d.lines.forEach(({name, line}) => {
      if (name === 'ivpu') {
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

export default handleActions(
  {
    [UPDATE_DATA]: handleUpdateData,
  },
  DEFAULT_STATE
);
