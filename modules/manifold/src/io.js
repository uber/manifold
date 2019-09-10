import {fetch, Request, Headers} from 'global';

const toParam = p => encodeURIComponent(JSON.stringify(p));

// [WIP] actions for sending requests if connected to a backend.
export function loadData({featureDataset, predDatasets, dataFilter}) {
  const h = new Headers({
    Accept: 'application/json',
  });
  const opts = {
    method: 'GET',
    headers: h,
  };
  const req = new Request(
    'manifold_py/api/load_data?' +
      `feature_dataset=${featureDataset}&pred_datasets=${toParam(
        predDatasets
      )}&data_filter=${toParam(dataFilter)}`,
    opts
  );
  return fetch(req);
}

// [WIP] actions for sending requests if connected to a backend.
export function modelsPerformance({
  nClusters = 5,
  metric = 'performance',
  baseModels = [],
  segmentFilters = [],
}) {
  const h = new Headers({
    Accept: 'application/json',
  });
  const opts = {
    method: 'GET',
    headers: h,
  };
  const req = new Request(
    'manifold_py/api/models_performance?' +
      `n_clusters=${nClusters}&metric=${metric}&` +
      `base_models=${toParam(baseModels)}&segment_filters=${toParam(
        segmentFilters
      )}`,
    opts
  );
  return fetch(req);
}

// [WIP] actions for sending requests if connected to a backend.
export function featuresDistribution({
  nClusters = 5,
  segmentGroups = [[1], [0, 2, 3]],
}) {
  const h = new Headers({
    Accept: 'application/json',
  });
  const opts = {
    method: 'GET',
    headers: h,
  };
  const req = new Request(
    'manifold_py/api/features_distribution?' +
      `segment_groups=${toParam(segmentGroups)}`,
    opts
  );
  return fetch(req);
}
