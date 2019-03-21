// @noflow
import React from 'react';
import document from 'global/document';
import {Provider} from 'react-redux';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {render} from 'react-dom';
import store from './store';
import App from './app';

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/" component={App} />
    </BrowserRouter>
  </Provider>
);

render(<Root />, document.body.appendChild(document.createElement('div')));
