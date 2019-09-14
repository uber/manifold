import {dotRange, computeClusters} from '@mlvis/mlvis-common/utils';
import {gatherDataset, filterDataset} from './utils';

export const computeManualSegmentationResult = (data, segmentFilters) => {
  return segmentFilters.map(filter => filterDataset(data, filter));
};

export const computeAutoSegmentationResult = (
  data,
  columnTypeRanges,
  nClusters
) => {
  const colIds = dotRange(...columnTypeRanges.score);
  const clusteringInputDataset = gatherDataset(data, colIds);

  const {columns} = clusteringInputDataset;
  const clusterIds = computeClusters(columns, nClusters, true);

  // todo: simplify the following ligic. `clusterIds` representation is sufficient
  const result = [];
  for (let i = 0; i < nClusters; i++) {
    result.push([]);
  }
  for (let i = 0; i < clusterIds.length; i++) {
    result[clusterIds[i]].push(i);
  }
  return result.filter(r => r.length > 0);
};
