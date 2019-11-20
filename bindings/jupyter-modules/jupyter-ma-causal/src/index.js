import React from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Container from './containers';
import reducer from './reducer';
import {window} from 'global';
export default props => {
  const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  return (
    <Provider store={store}>
      <Container {...props} />
    </Provider>
  );
};
