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
print(pd.DataFrame(data)[10000:10010])
```

           hour_of_week        value
    10000            66  0.272818888
    10001            66  0.645657585
    10002            66  0.243684833
    10003            66  0.237157524
    10004            66  0.238575395
    10005            66  0.175796772
    10006            66  0.226707148
    10007            66  0.221181026
    10008            66  0.263068202
    10009            66  0.140494919


## Properties

#### `data` (List, required)

- Default: []

The input data list, each datum should at least two attributes: _hour_of_week_ (range: [0, 167]) and _value_.

#### `valueRange` (List, optional)

- Default: [0, 1]

The value range used for the color mapping. If data is not specified, valueRange is default to [0, 1]. Otherwise, it will be derived as the [min, max] of the values.
