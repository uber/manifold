import React from 'react';
import {createSelector} from 'reselect';
import {extent} from 'd3-array';

const DEFAULT_WIDGET_WIDTH = 500;
const DEFAULT_WIDGET_HEIGHT = 500;
const LEGEND_HEIGHT = 48;
const RESOLUTION = 100;

/**
 * Extract the hour and the value attributes from the given data
 * @param {array} data - input data of arbitory attributes
 * @param {func} getHour - accessor function to extract the hour value from a datum
 * @param {func} getValue - accessor function to extract the metric value from a datum
 * @return an array of objects only contains hour and value for the downsteam rendering
 */
export const extractHourAndValue = (
  data = [],
  getHour = d => Number(d['hour_of_week']),
  getValue = d => Number(d['value'])
) => {
  return data.map(d => ({
    hour: getHour(d),
    value: getValue(d),
  }));
};

/**
 * Derive the min and max values of an given array of data
 * @param {array} data - input data with attribute value
 * @return the min and max values in shape of [min, max]
 */
export const extractValueRange = data => {
  if (!data || data.length === 0) {
    return [0, 1];
  }
  return extent(data, d => d.value);
};

/**
 * Derive an hashmap storing all the values for each hour as key
 * @param {array} data - input data of hour and value
 * @return an object with hour as key, and all values associate with that hour as value
 */
export const createHourlyValueMap = data => {
  if (!data || data.length === 0) {
    return {};
  }

  return data.reduce((acc, {hour, value}) => {
    if (acc[hour]) {
      acc[hour].push(value);
    } else {
      acc[hour] = [value];
    }
    return acc;
  }, {});
};

/**
 * Convert a given hour: values map to an array of calendar meta data
 * TODO: will break this funciton into multiple functions and reuse those in mlvis-common
 * @param {object} hourlyValueMap - a hash map of hour: values
 * @return an array of object, with day & hour as row & column Ids
 * and the equalized distribution
 */
export const createHourlyValueDistribution = hourlyValueMap => {
  return Object.keys(hourlyValueMap).map(hour => {
    const histogram = hourlyValueMap[hour].reduce((histo, value) => {
      const bin = Math.sign(value) * Math.floor(Math.abs(value) * RESOLUTION);
      if (histo[bin]) {
        histo[bin] += 1;
      } else {
        histo[bin] = 1;
      }
      return histo;
    }, {});

    const sortedEntries = Object.entries(histogram)
      .map(([bin, count]) => [Number(bin), count])
      .sort(([a], [b]) => a - b);

    const prefixSumEntries = sortedEntries.reduce(
      (prefixSum, [bin, count], idx) => {
        const prevCount = prefixSum[idx][1];
        prefixSum.push([bin, prevCount + count]);
        return prefixSum;
      },
      [sortedEntries[0]]
    );

    const prefixSum = prefixSumEntries[prefixSumEntries.length - 1][1];
    const distribution = prefixSumEntries.map(([bin, count]) => ({
      // decimal => percentage
      stop: (count / prefixSum) * 100,
      value: bin / RESOLUTION,
    }));

    return {
      day: Math.floor(hour / 24),
      hour: hour % 24,
      distribution,
    };
  });
};

// Chained selectors, only changes in data, getHour, and getValue
// will cause recomputation of hourly value distribution
const hourAndValueSelector = createSelector(
  props => props.data,
  props => props.getHour,
  props => props.getValue,
  extractHourAndValue
);

const valueRangeSelector = createSelector(
  hourAndValueSelector,
  extractValueRange
);

const hourlyValueMapSelector = createSelector(
  hourAndValueSelector,
  createHourlyValueMap
);

const hourlyValueDistributionSelector = createSelector(
  hourlyValueMapSelector,
  createHourlyValueDistribution
);

/**
 * An HOC to derive the calendar cell width and height from the widget width and height
 * @param {object} Component - component with props include {width, height}
 * @return the component with derived cell width and height injected as new props
 */
export const withDerivedLayout = Component => props => {
  const {width = DEFAULT_WIDGET_WIDTH, height = DEFAULT_WIDGET_HEIGHT} = props;
  // column width, 9 = 7 days + 2 margins
  const cellWidth = width / 9;
  // row height, 25 = 24 hours + 1 top margins
  const cellHeight = (height - LEGEND_HEIGHT) / 25;
  return <Component {...props} cellWidth={cellWidth} cellHeight={cellHeight} />;
};

/**
 * TODO, fold the precompute checking logic into the selectors
 * An HOC to derive data from the raw hour, value format to a consumable format for rendering
 * @param {object} Component - component with props include {data, valueRange(optional)}
 * @return the component with derived data and value range injected as new props
 */
export const withDerivedData = Component => props => {
  const {data, valueRange} = props;
  if (!data || data.length === 0) {
    return null;
  }
  // if data comes with valid, precomputed meta data, use them directly
  const {day, hour, distribution = []} = data[0];
  if ([distribution.concat([day, hour])].every(Number.isFinite)) {
    return <Component {...props} />;
  }
  // else, derive the meta data based on hour and value
  const derivedData = hourlyValueDistributionSelector(props);
  // if users predefines the valueRange, use it with the derived data
  if (valueRange && valueRange.every(Number.isFinite)) {
    return <Component {...props} data={derivedData} />;
  }
  // else, use both derived data and derived value range
  const derivedValueRange = valueRangeSelector(props);
  return (
    <Component {...props} data={derivedData} valueRange={derivedValueRange} />
  );
};
