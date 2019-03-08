# Manifold

<img alt="Manifold" src="https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/Manifold_Header.jpg" width="600">

Manifold is a model-agnostic visual debugging tool for machine learning.

Understanding ML model performance and behavior is a non-trivial process, given intrisic opacity of ML algorithms. Performance summary statistics such as AUC, RMSE... are not instructive enough for identifying what went wrong with a model or how to improve it.

As a visual analytics tool, Manifold allows ML practitioners to look beyond overall summary metrics to detect which subset of data a model is inaccurately predicting. Manifold also explains the potential cause of poor model performance by surfacing the feature distribution difference between better and worse-performing subsets of data.

## Table of content

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [License](#license)

## Install Manifold
```bash
$ npm install @uber/manifold
```

## Use in a web app

Here are the basic steps to import manifold into your app. You also take a look at the examples folder.

### 1. Mount reducer

Manifold uses Redux to manage its internal state. You need to register manifold reducer to the main reducer of your app:

```js
import manifoldReducer from '@uber/manifold/reducers';
import {combineReducers, createStore, compose} from 'redux';

const initialState = {};
const reducers = combineReducers({
  // mount manifold reducer in your app
  manifold: manifoldReducer,

  // Your other reducers here
  app: appReducer
});

// using createStore
export default createStore(reducer, initialState);

```

### 2. Mount Component
If you mount manifold reducer in another address instead of `manifold` in the step above, you will need to specify the path to it when you mount the component
with the `getState` prop.

```js
import Manifold from '@uber/manifold';

const Main = props => (
  <Manifold getState={state => state.pathTo.manifold}/>
);
```

## Built With
- [TensorFlow.js](https://js.tensorflow.org/)
- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)

## Contributing
Please read our [code of conduct](CODE_OF_CONDUCT.md) before you contribute! You can find details for submitting pull requests in the [CONTRIBUTING.md](CONTRIBUTING.md) file. Issue [template](https://help.github.com/articles/about-issue-and-pull-request-templates/).

## Versioning
We document versions and changes in our changelog - see the [CHANGELOG.md](CHANGELOG.md) file for details.

## License
TBD
