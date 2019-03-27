[![Build Status](https://travis-ci.com/uber/manifold.svg?token=SZsMuk4iZZDLKwRXzyxu&branch=master)](https://travis-ci.com/uber/manifold)

# Manifold

<img alt="Manifold" src="https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/Manifold_Header.jpg" width="600">

Manifold is a model-agnostic visual debugging tool for machine learning.

Understanding ML model performance and behavior is a non-trivial process, given intrisic opacity of ML algorithms. Performance summary statistics such as AUC, RMSE... are not instructive enough for identifying what went wrong with a model or how to improve it.

As a visual analytics tool, Manifold allows ML practitioners to look beyond overall summary metrics to detect which subset of data a model is inaccurately predicting. Manifold also explains the potential cause of poor model performance by surfacing the feature distribution difference between better and worse-performing subsets of data.

## Table of content

- [Prepare your data](#prepare-your-data)
- [Using the Demo App](#using-the-demo-app)
- [Using the Component](#using-the-component)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [License](#license)

## Prepare Your Data

To generate Manifold visualization, you need to prepare data in the following schema:

```js
const data = {
  x:     [...],         // feature data
  yPred: [[...], ...]   // prediction data
  yTrue: [...],         // ground truth data
};
```

Each element in these arrays represents one data point in your evaluation dataset, and the order of data instances in `x`, `yPred` and `yTrue` should all match.
Recommended instance count for each of these datasets is 10000 - 15000. If you have a larger dataset that you want to analyze, a random subset of your data generally suffices to reveal the important patterns in it.

There are 2 ways to input the data into Manifold:

- [csv upload](#upload-csv-to-demo-app) if you are using the Manifold demo app, or
- [convert data programatically](#convert-input-data) if you using the Manifold component in your own app.

##### `x`: {Object[]}

A list of instances with features. Example (2 data instances):

```js
[
  {feature_0: 21, feature_1: 'B'},
  {feature_0: 36, feature_1: 'A'}
]
```

##### `yPred`: {Object[][]}

A list of list, each child list is a prediction array from one model for each data instance. Example (3 models, 2 data instances, 2 classes `['false', 'true']`):

```js
[
  [{false: 0.1, true: 0.9}, {false: 0.8, true: 0.2}],
  [{false: 0.3, true: 0.7}, {false: 0.9, true: 0.1}],
  [{false: 0.6, true: 0.4}, {false: 0.4, true: 0.6}]
]
```

##### `yTrue`: {Number[] | String[]}

A list, ground truth for each data instance. Values must be numbers for regression model, must be strings that match object keys in `yPred` for classification models. Example (2 data instances, 2 classes ['false', 'true']):

```js
[
  'true',
  'false'
]
```

## Using the Demo App

To do a one-off evaluation using static outputs of your ML models, using the demo app is an easier way for you.
Otherwise, if you have a system that programmatically generates ML model outputs, you might consider [using the Manifold component](#using-the-component) directly.

### Upload CSV to Demo App



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

### 3. Load Data
In order to load your data files to Manifold, use `loadLocalData` action. You could also reshape your data into
the required Manifold format using `dataTransformer`.

```js
import {loadLocalData} from '@uber/manifold/actions';

// create the following action and pass to dispatch
loadLocalData({
  fileList,
  dataTransformer,
});
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
Apache 2.0 License
