# Stacked Calendar

The _Stacked Calendar_ component aggregates hourly-stamped values and visualizes the results in the form of a calendar.

The columns and rows are corresponding to the day_of_week and hour_of_day, respectively.\
The data values of each cell (hour) are aggregated, percentiled, and mapped to color gradients to reveal the value distributions.

## Usage

```js
import StackedCalendar from '@mlvis/stacked-calendar';

const App = ({data, valueRange}) => {
  /**
   * data: [
   *   {hour_of_week: 0, value: 0.5},
   *   {hour_of_week: 0, value: 1.0},
   *   {hour_of_week: 1, value: 2.0},
   *   ...
   *   {hour_of_week: 167, value: 0.8},
   *   {hour_of_week: 167, value: 0.4},
   * ],
   * valueRange: [0, 1]
   */
  return <StackedCalendar data={data} valueRange={valueRange} />;
};
```

## Data Format

| hour_of_week (range: [0, 167]) | value |
| :----------------------------: | :---: |
|               0                |  0.5  |
|               0                |  1.0  |
|               1                |  2.0  |
|              ...               |  ...  |
|              167               |  0.8  |
|              167               |  0.4  |

## Installation

To install the dependencies from NPM:

```bash
npm install @mlvis/stacked-calendar
# or
yarn install @mlvis/stacked-calendar
```

## Properties

#### `data` (Array, required)

- Default: []

The input data array, each datum should at least two attributes: _hour_of_week_ (range: [0, 167]) and _value_.

#### `valueRange` (Array, optional)

- Default: [0, 1]

The value range used for the color mapping. If data is not specified, valueRange is default to [0, 1]. Otherwise, it will be derived as the [min, max] of the values.

## Source

[packages/stacked-calendar](https://code.uberinternal.com/diffusion/VIMLVMN/browse/master/packages/stacked-calendar/)

<!-- STORY HIDE START -->

Content here won't be shown in stories.
You can add some unfinished documentation here.

<!-- STORY HIDE END -->
