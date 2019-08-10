import React from 'react';
import {render} from 'react-dom';
import document from 'global/document';
import {Provider} from 'react-redux';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import store from './reducers';
import Demo from '../../examples/manifold/src/app';
// TODO: removing antd in index.css will mess up the styles. Adjust styles before getting rid of antd dependency.
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/" component={Demo} />
    </BrowserRouter>
  </Provider>
);

render(<Root />, document.body.appendChild(document.createElement('div')));
