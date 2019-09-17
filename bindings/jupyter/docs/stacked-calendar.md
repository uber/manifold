# Stacked Calendar

The Stacked Calendar component aggregates hourly-stamped values and visualizes the results in the form of a calendar.

The columns and rows are corresponding to the day_of_week and hour_of_day, respectively.
The data values of each cell (hour) are aggregated, percentiled, and mapped to color gradients to reveal the value distributions.

## Usage

```python
from mlvis import StackedCalendar
from IPython.display import display
import pandas as pd

PREFIX = 'https://d1a3f4spazzrp4.cloudfront.net/mlvis/'
data_frame = pd.read_csv(PREFIX + 'jupyter/stacked-calendar-sample.csv')
data = data_frame.to_dict('records')

calendar = StackedCalendar(props={"data": data, "valueRange": [0, 1.5]})
display(calendar)
```

<img alt="Jupyter" width="500" src="https://d1a3f4spazzrp4.cloudfront.net/mlvis/jupyter/docs/stacked-calendar.png"></img>

## Data Format

```python
pd.DataFrame(data)[10000:10010]
```

<div>
<style>
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
      <th>hour_of_week</th>
      <th>value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>10000</th>
      <td>66</td>
      <td>0.272818888</td>
    </tr>
    <tr>
      <th>10001</th>
      <td>66</td>
      <td>0.645657585</td>
    </tr>
    <tr>
      <th>10002</th>
      <td>66</td>
      <td>0.243684833</td>
    </tr>
    <tr>
      <th>10003</th>
      <td>66</td>
      <td>0.237157524</td>
    </tr>
    <tr>
      <th>10004</th>
      <td>66</td>
      <td>0.238575395</td>
    </tr>
    <tr>
      <th>10005</th>
      <td>66</td>
      <td>0.175796772</td>
    </tr>
    <tr>
      <th>10006</th>
      <td>66</td>
      <td>0.226707148</td>
    </tr>
    <tr>
      <th>10007</th>
      <td>66</td>
      <td>0.221181026</td>
    </tr>
    <tr>
      <th>10008</th>
      <td>66</td>
      <td>0.263068202</td>
    </tr>
    <tr>
      <th>10009</th>
      <td>66</td>
      <td>0.140494919</td>
    </tr>
  </tbody>
</table>
</div>

## Properties

#### `data` (List, required)

- Default: []

The input data list, each datum should at least two attributes: _hour_of_week_ (range: [0, 167]) and _value_.

#### `valueRange` (List, optional)

- Default: [0, 1]

The value range used for the color mapping. If data is not specified, valueRange is default to [0, 1]. Otherwise, it will be derived as the [min, max] of the values.
