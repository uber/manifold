// @noflow
import {createSelector} from 'reselect';
import {computePercentiles, computeDensity} from 'packages/mlvis-common/utils';

const getData = props => props.data;

const PERCENTILE_LIST = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];
// "percentiles" includes [.01, .1, .25, .5, .75, .9, .99] percentiles of model performance
export const getPercentiles = createSelector(
  [getData, props => props.percentiles],
  (data, percentiles) =>
    percentiles || computePercentiles(data, PERCENTILE_LIST)
);

const MODEL_PERF_HISTOGRAM_RESOLUTION = 50;
export const getDensity = createSelector(
  [getData, props => props.density],
  (data, density) =>
    density || computeDensity(data, MODEL_PERF_HISTOGRAM_RESOLUTION)
);

export const getNumDataPoints = createSelector(
  [getData, props => props.numDataPoints],
  (data, numDataPoints) =>
    numDataPoints && !isNaN(numDataPoints) ? numDataPoints : data[0].length
);
