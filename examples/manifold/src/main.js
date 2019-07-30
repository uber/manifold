// @noflow
// generator function from kepler layers need it
// https://github.com/GitbookIO/expect-firestore/issues/1#issuecomment-370590583
import '@babel/polyfill';
import React from 'react';
import document from 'global/document';
import {Provider} from 'react-redux';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {render} from 'react-dom';
import store from './store';
import App from './app';
// TODO: removing antd in index.css will mess up the styles. Adjust styles before getting rid of antd dependency.
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/" component={App} />
    </BrowserRouter>
  </Provider>
);

render(<Root />, document.body.appendChild(document.createElement('div')));
