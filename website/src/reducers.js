import {combineReducers, createStore, applyMiddleware, compose} from 'redux';
import {routerReducer} from 'react-router-redux';
import thunk from 'redux-thunk';
import demoReducer from '../../examples/manifold/src/reducers';
import {taskMiddleware} from 'react-palm/tasks';
// TODO: add analytics
// import analyticsMiddleware from './analytics';

const initialState = {};
const reducers = {
  demo: demoReducer,
  routing: routerReducer,
};

const combinedReducers = combineReducers(reducers);

export const middlewares = [
  taskMiddleware,
  thunk,
  // analyticsMiddleware,
];

export const enhancers = [applyMiddleware(...middlewares)];

const composeEnhancers = compose;
// add redux devtools
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  combinedReducers,
  initialState,
  composeEnhancers(...enhancers)
);
