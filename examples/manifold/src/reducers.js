// @noflow
import {combineReducers} from 'redux';
import {handleActions} from 'redux-actions';
import {UPDATE_VIEWPORT} from './actions';
import manifoldReducer from '@mlvis/manifold/reducers';

export const DEFAULT_STATE = {
  width: 0,
  height: 0,
};

const handleUpdateViewport = (state, {payload}) => ({
  ...state,
  width: payload.width,
  height: payload.height,
});

export const appReducer = handleActions(
  {
    [UPDATE_VIEWPORT]: handleUpdateViewport,
  },
  DEFAULT_STATE
);

export default combineReducers({
  // mount Manifold reducer
  manifold: manifoldReducer,
  app: appReducer,
});
