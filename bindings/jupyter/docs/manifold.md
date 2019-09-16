# Manifold

Manifold is a model-agnostic visual debugging tool for machine learning.

Understanding ML model performance and behavior is a non-trivial process, given intrinsic opacity of ML algorithms. Performance summary statistics such as AUC, RMSE... are not instructive enough for identifying what went wrong with a model or how to improve it.

As a visual analytics tool, Manifold allows ML practitioners to look beyond overall summary metrics to detect which subset of data a model is inaccurately predicting. Manifold also explains the potential cause of poor model performance by surfacing the feature distribution difference between better and worse-performing subsets of data.

## Usage


```python
from mlvis import Manifold
import sys, json, math
from random import uniform

def generate_random_categorical_value(categories):
    return categories[int(math.floor(uniform(0, 1) * len(categories)))]

num_instances = 100
categories = ['A', 'B', 'C', 'D']
domain = [1, 1000]
classes = ['true', 'false']

x = [{'feature_0': math.floor(uniform(*domain)),
      'feature_1': generate_random_categorical_value(categories)}
     for i in range(0, num_instances)]

yPred = [0] * 3
for i in range(0, len(yPred)):
    yPred[i] = [0] * num_instances
    for j in range(0, num_instances):
        d = uniform(0, 1)
        yPred[i][j] = {
            classes[0]: d,
            classes[1]: 1 - d
        }

yTrue = [generate_random_categorical_value(classes) for i in range(0, num_instances)]

Manifold(props={'data': {
    'x': x,
    'yPred': yPred,
    'yTrue': yTrue
}})
```

<img alt="Jupyter" src="https://d1a3f4spazzrp4.cloudfront.net/mlvis/jupyter/docs/manifold.png"></img>

## Data Format

```python
data = {
  x:     [...],         # feature data
  yPred: [[...], ...]   # prediction data
  yTrue: [...],         # ground truth data
};
```

Each element in these lists represents one data point in your evaluation dataset, and the order of data instances in `x`, `yPred` and `yTrue` should all match.
Recommended instance count for each of these datasets is 10000 - 15000. If you have a larger dataset that you want to analyze, a random subset of your data generally suffices to reveal the important patterns in it.

##### `x` (list | ndarray | data_frame, required):
A list/ndarray/data_frame of instances with features. Example (2 data instances):


```python
x = [
  {'feature_0': 21, 'feature_1': 'B'},
  {'feature_0': 36, 'feature_1': 'A'}
]
```

Example with ndarray:


```python
import numpy as np
x = np.array([
  {'feature_0': 21, 'feature_1': 'B'},
  {'feature_0': 36, 'feature_1': 'A'}
])
x
```




    array([{'feature_0': 21, 'feature_1': 'B'},
           {'feature_0': 36, 'feature_1': 'A'}], dtype=object)



Example with data_frame


```python
import pandas as pd
x = pd.DataFrame([
  {'feature_0': 21, 'feature_1': 'B'},
  {'feature_0': 36, 'feature_1': 'A'}
])
x
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>feature_0</th>
      <th>feature_1</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>21</td>
      <td>B</td>
    </tr>
    <tr>
      <td>1</td>
      <td>36</td>
      <td>A</td>
    </tr>
  </tbody>
</table>
</div>



##### `yPred` (list, required):
A list of list or data frames, each child list is a prediction array from one model for each data instance. Example (3 models, 2 data instances, 2 classes `['false', 'true']`):


```python
yPred = [
  [{'false': 0.1, 'true': 0.9}, {'false': 0.8, 'true': 0.2}],
  [{'false': 0.3, 'true': 0.7}, {'false': 0.9, 'true': 0.1}],
  [{'false': 0.6, 'true': 0.4}, {'false': 0.4, 'true': 0.6}]
]
```

Example with a list of data frame:


```python
import pandas as pd
from IPython.display import display
yPred = [
  pd.DataFrame([{'false': 0.1, 'true': 0.9}, {'false': 0.8, 'true': 0.2}]),
  pd.DataFrame([{'false': 0.3, 'true': 0.7}, {'false': 0.9, 'true': 0.1}]),
  pd.DataFrame([{'false': 0.6, 'true': 0.4}, {'false': 0.4, 'true': 0.6}])
]
for i, y in enumerate(yPred):
    print('Model ' + str(i) + ' is:')
    display(y)
```

    Model 0 is:



<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>false</th>
      <th>true</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>0.1</td>
      <td>0.9</td>
    </tr>
    <tr>
      <td>1</td>
      <td>0.8</td>
      <td>0.2</td>
    </tr>
  </tbody>
</table>
</div>


    Model 1 is:



<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>false</th>
      <th>true</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>0.3</td>
      <td>0.7</td>
    </tr>
    <tr>
      <td>1</td>
      <td>0.9</td>
      <td>0.1</td>
    </tr>
  </tbody>
</table>
</div>


    Model 2 is:



<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>false</th>
      <th>true</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>0.6</td>
      <td>0.4</td>
    </tr>
    <tr>
      <td>1</td>
      <td>0.4</td>
      <td>0.6</td>
    </tr>
  </tbody>
</table>
</div>


##### `yTrue` (list | ndarray | data_frame, required):
A list, ground truth for each data instance. Values must be numbers for regression model, must be strings that match object keys in `yPred` for classification models. Example (2 data instances, 2 classes ['false', 'true']):


```python
yTrue = [
  'true',
  'false'
]
```

Example with ndarray:


```python
import numpy as np
yTrue = np.array([
  'true',
  'false'
])
yTrue
```




    array(['true', 'false'], dtype='<U5')



Example with data_frame


```python
import pandas as pd
yTrue = pd.DataFrame([
  'true',
  'false'
])
yTrue
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>0</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>true</td>
    </tr>
    <tr>
      <td>1</td>
      <td>false</td>
    </tr>
  </tbody>
</table>
</div>
