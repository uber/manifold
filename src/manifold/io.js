// @noflow
import {parse, unparse} from 'papaparse';
import {fetch, Blob, Request, Headers} from 'global';
import {saveAs} from 'file-saver';

const toParam = p => encodeURIComponent(JSON.stringify(p));

const loadCsvFileWithoutWorker = (path, onComplete) => {
  const batchId = Date.now();
  parse(path, {
    delimiter: ',',
    download: true,
    dynamicTyping: true,
    header: true,
    newline: '',
    quotes: false,
    quoteChar: '"',
    skipEmptyLines: true,
    complete: results => {
      const {
        data,
        meta: {fields},
      } = results;
      onComplete({data, fields, batchId});
    },
  });
};

export const parsePromise = file => {
  return new Promise((onComplete, onError) => {
    loadCsvFileWithoutWorker(file.originFileObj || file, onComplete);
  });
};

export const saveCsvFile = (path, jsonData) => {
  if (!path || !jsonData || Object.keys(jsonData).length === 0) {
    return;
  }
  saveAs(new Blob([unparse(jsonData)], {type: 'text/csv;charset=utf-8'}), path);
};

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
