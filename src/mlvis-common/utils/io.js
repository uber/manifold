// @noflow
import {parse, unparse} from 'papaparse';
import {parse as loadersGLParse} from '@loaders.gl/core';
import {ArrowLoader} from '@loaders.gl/arrow';
import {fetch, Blob} from 'global';

import {saveAs} from 'file-saver';

// cdn path prefix for s3 uber-static buckets
const PREFIX = 'https://d1a3f4spazzrp4.cloudfront.net/mlvis';

/**
 * a utility function that takes as input a path to the file, and returns the
 * loaded data, its fields, and the batchId  via the callback function
 *
 * @param {string} path: input file path
 * @param {function} onComplete: callback function to surface the loaded data
 * @return an object that contains the loaded data, fields and batch Id.
 */
export const loadCsvFileWithoutWorker = (path, onComplete) => {
  const batchId = Date.now();
  // https://www.papaparse.com/docs#config
  parse(path, {
    delimiter: ',',
    download: true,
    dynamicTyping: true,
    // TODO: header: true lead to large memory consumption
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

export const parseArrow = async file => {
  const res = await loadersGLParse(file, ArrowLoader);
  return res;
};

/**
 * a promise wraper over the loadCsvFileWithoutWorker function
 *
 * @param {string} file: input file path
 * @return a promise contains the onComplete and onError callbacks.
 */
export const parsePromise = file => {
  return new Promise((onComplete, onError) => {
    loadCsvFileWithoutWorker(file.originFileObj || file, onComplete);
  });
};

/**
 * a utility function that exports an input json blob to a specified file path
 *
 * @param {string} path: output file path
 * @param {object} jsonData: data in json format to be serialized
 */
export const saveCsvFile = (path, jsonData) => {
  if (!path || !jsonData || Object.keys(jsonData).length === 0) {
    return;
  }
  saveAs(new Blob([unparse(jsonData)], {type: 'text/csv;charset=utf-8'}), path);
};

/**
 * a utility function that loads a list of files from S3, asynchronously
 * currently, only .json, .csv and .arrow files are supported.
 *
 * example usage:
 *   fetchFromS3([
 *     'graphvis/tsne.json',
 *     'graphvis/graph.json',
 *     'graphvis/speeds.json',
 *   ]).then(([embedding, graph, speed]) => {
 *      // use the loaded data here
 *   });
 *
 * @param {array} paths: a list file paths on S3
 * @return an array of promises with data loaded from the specified paths
 */
export const fetchFromS3 = async paths =>
  await Promise.all(
    paths.map(async path => {
      if (path.endsWith('.json')) {
        const response = await fetch(`${PREFIX}/${path}`);
        return await response.json();
      } else if (path.endsWith('.csv')) {
        // parsePromise is a promise wraper over the loadCsvFileWithoutWorker function
        const response = await parsePromise(`${PREFIX}/${path}`);
        return await response.data;
      } else if (path.endsWith('.arrow')) {
        const file = await fetch(`${PREFIX}/${path}`);
        const response = await parseArrow(file);
        return response;
      }
      /* eslint-disable no-console */
      console.warn(`${path} file format not supported.`);
      /* eslint-enable no-console */
    })
  );

/**
 * a utility function that parses a list of uploaded files, asynchronously
 * currently, only .csv and .arrow files are supported.
 *
 * example usage:
 *   loadFromLocal([
 *     'manifold/geo_partition.arrow',
 *     'manifold/geo_nopartition.arrow',
 *   ]).then(([partitionData, noPartitionData]) => {
 *      // use the loaded data here
 *   });
 *
 * @param {[File]} fileList: a list of files
 * @return an array of promises with data parsed from the files
 */
export const loadFromLocal = async fileList =>
  await Promise.all(
    fileList.map(async file => {
      const {name, type, originFileObj} = file;
      if (type === 'text/csv') {
        const response = await parsePromise(originFileObj);
        return await response.data;
      } else if (name.endsWith('.arrow')) {
        const response = await parseArrow(originFileObj);
        return response;
      }
      /* eslint-disable no-console */
      console.warn(`${name} file format not supported.`);
      /* eslint-enable no-console */
    })
  );
