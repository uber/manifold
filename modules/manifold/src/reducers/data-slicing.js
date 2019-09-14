import {
  sliceDataset,
  concatDataset,
  columnsAndFieldsFromScore,
  getDefaultSegmentGroups,
  defaultSegmentFiltersFromBaseCols,
} from '../utils';

import {SEGMENTATION_METHOD} from '../constants';

export const handleUpdateMetric = (state, {payload}) => {
  const {data, columnTypeRanges, modelsMeta} = state;

  const {columns: columnsYPred} = sliceDataset(data, columnTypeRanges.yPred);
  const {columns: columnsYTrue} = sliceDataset(data, columnTypeRanges.yTrue);
  const {func: scoreFunc} = payload;

  // todo: 1) this might be slow 2) memoize to reduce repeated computing
  const scoreDataset = columnsAndFieldsFromScore(
    columnsYPred,
    columnsYTrue,
    modelsMeta,
    scoreFunc
  );
  const _data = concatDataset([
    sliceDataset(data, [0, columnTypeRanges.yTrue[1]]),
    scoreDataset,
  ]);

  return {
    ...state,
    data: _data,
    metric: payload,
  };
};

export const handleUpdateSegmentationMethod = (state, {payload}) => {
  const isManualSegmentation = payload === SEGMENTATION_METHOD.MANUAL;
  // invalidating it to make sure no legacy value exists
  const nClusters = isManualSegmentation ? null : state.nClusters;
  const segmentFilters = isManualSegmentation
    ? defaultSegmentFiltersFromBaseCols(state.data, state.baseCols)
    : null;
  return {
    ...state,
    isManualSegmentation,
    nClusters,
    segmentFilters,
  };
};

export const handleUpdateBaseCols = (state, {payload}) => {
  const segmentFilters = defaultSegmentFiltersFromBaseCols(state.data, payload);
  return {
    ...state,
    baseCols: payload,
    segmentFilters,
  };
};

export const handleUpdateNClusters = (state, {payload}) => {
  const delta = payload === 'INC' ? 1 : payload === 'DEC' ? -1 : 0;
  return {
    ...state,
    nClusters: state.nClusters + delta,
    segmentGroups: getDefaultSegmentGroups(state.nClusters + delta),
  };
};

export const handleUpdateSegmentFilters = (state, {payload = []}) => {
  const {nClusters} = state;
  const newNClusters = payload && payload.length ? payload.length : nClusters;
  return {
    ...state,
    segmentFilters: payload,
    nClusters: newNClusters,
    segmentGroups: getDefaultSegmentGroups(newNClusters),
  };
};

export const handleUpdateSegmentGroups = (state, {payload}) => {
  return {
    ...state,
    segmentGroups: payload,
  };
};
