import {handleActions} from 'redux-actions';

import {UPDATE_DATA} from './actions';

const DEFAULT_STATE = {
  containerWidth: 800,
  containerHeight: 800,
  data: null,
};

const handleUpdateData = (state, {payload}) => ({
  ...state,
  data: payload,
});

export default handleActions(
  {
    [UPDATE_DATA]: handleUpdateData,
  },
  DEFAULT_STATE
);
