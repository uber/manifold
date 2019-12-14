import React from 'react';
import {createStore, compose, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {manifoldReducer, enhanceReduxMiddleware} from '@mlvis/manifold';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import Manifold from './manifold';
import Controls from './controls';
import {window} from 'global';

// https://github.com/jhen0409/react-native-debugger/issues/280
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default props => {
  const store = createStore(
    manifoldReducer,
    composeEnhancer(applyMiddleware(...enhanceReduxMiddleware([thunk])))
  );
  const engine = new Styletron();
  return (
    <Provider store={store}>
      <StyletronProvider value={engine}>
        <React.Fragment>
          <Controls
            widgetModel={props.widgetModel}
            widgetView={props.widgetView}
          />
          <Manifold {...props} />
        </React.Fragment>
      </StyletronProvider>
    </Provider>
  );
};
