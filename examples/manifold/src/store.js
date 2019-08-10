import {combineReducers, createStore, applyMiddleware, compose} from 'redux';
import {routerReducer} from 'react-router-redux';
import thunk from 'redux-thunk';
import window from 'global/window';
import demoReducer from './reducers';
import {enhanceReduxMiddleware} from 'packages/manifold/middleware';

const reducers = combineReducers({
  demo: demoReducer,
  routing: routerReducer,
});

export const middlewares = enhanceReduxMiddleware([thunk]);
export const enhancers = [applyMiddleware(...middlewares)];

const initialState = {};

// add redux devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  reducers,
  initialState,
  composeEnhancers(...enhancers)
);
