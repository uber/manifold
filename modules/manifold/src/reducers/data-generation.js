import {sliceDataset, concatDataset, columnsAndFieldsFromScore} from '../utils';

export const handleUpdateMetric = (state, {payload}) => {
  const {data, columnTypeRanges, modelsMeta} = state;

  const {columns: columnsYPred} = sliceDataset(data, columnTypeRanges.yPred);
  const {columns: columnsYTrue} = sliceDataset(data, columnTypeRanges.yTrue);
  const {func: scoreFunc} = payload;

  // todo: memoize to reduce repeated computing
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
