import React from 'react';
import {createStore, compose, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {manifoldReducer, enhanceReduxMiddleware} from '@mlvis/manifold';
import Manifold from './manifold';
import Controls from './controls';
import {window} from 'global';

// https://github.com/jhen0409/react-native-debugger/issues/280
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  manifoldReducer,
  composeEnhancer(applyMiddleware(...enhanceReduxMiddleware([thunk])))
);

export default props => (
  <Provider store={store}>
    <React.Fragment>
      <Controls widgetModel={props.widgetModel} widgetView={props.widgetView} />
      <Manifold {...props} />
    </React.Fragment>
  </Provider>
);
