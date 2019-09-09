import * as tf from '@tensorflow/tfjs-core';

/**
 * kmeans
 * @param {Array<Array>} data 2D data to run kmeans on. shape = [nInstances, nFeatures]
 * @param {Number} nClusters
 * @param {Boolean} transposeInput if the input data array shape is [nFeatures, nInstances], use transposeInput = true
 * @param {Number} maxIterations number of iterations before force stop
 * @param {Number} tolerance
 */
export const computeClusters = (
  data,
  nClusters,
  transposeInput = false,
  maxIterations = 300,
  tolerance = 10e-4
) => {
  if (!data.length) {
    return [];
  }
  return tf.tidy(() => {
    let samples = tf.tensor2d(data).toFloat();
    if (transposeInput) {
      samples = tf.transpose(samples);
    }
    let centroids = initCentroids(samples, nClusters);
    let nearest;
    for (let i = 0; i < maxIterations; i++) {
      nearest = assignClusterId(samples, centroids);
      centroids = updateCentroids(samples, nearest, nClusters);
    }
    // return an array of indices, representing the nearest "centroid" to each data point
    return nearest.dataSync();
  });
};

/**
 * @param {Tensor2D} X - 2-D array of data points being clustered, shape = [nInstances, nFeatures]
 * @param {Number} nClusters - number of clusters
 * @return 2-D array centroids. shape = [nClusters, nFeatures]
 */
export function initCentroids(X, nClusters) {
  const indices = [];
  while (indices.length < nClusters) {
    const ind = Math.floor(Math.random() * X.shape[0]);
    if (!indices.includes(ind)) {
      indices.push(ind);
    }
  }
  return tf.gather(X, indices);
}

/**
 * give each data instance a cluster assignment, based on which cluster centroid is nearest to it
 * @param {Tensor2D} samples - data points being clustered, shape = [nInstances, nDims]
 * @param {Tensor2D} centroids - positions of cluster centers, shape = [nClusters, nDims]
 * @param {Boolean} fillEmpty - whether to enforce all clusters to be non-empty
 * @returns {Tensor1D} indices of the nearest centroid to each data instance, shape = [nInscances]
 */
export function assignClusterId(samples, centroids, fillEmpty = true) {
  return tf.tidy(() => {
    // perform outer operations by expanding dimensions
    const expandedVectors = tf.expandDims(samples, 0);
    const expandedCentroids = tf.expandDims(centroids, 1);
    const distances = tf.sum(
      tf.square(tf.sub(expandedVectors, expandedCentroids)),
      2
    );
    if (fillEmpty) {
      return fillEmptyClusters(distances);
    }
    const mins = tf.argMin(distances, 0);
    return mins.toInt();
  });
}

/**
 * check whether nearest include all possible cluster Ids
 * (i.e.all clusters have non - zero number of instances)
 * if not, assign the one with farthest distance from center to the missing cluster
 * @param {Tensor2D} distances - distances between data instances and centroids, shape = [nClusters, nInscances]
 * @param {Number} minCount - minimum number of instances in a cluster
 * @returns {Tensor1D} indices of the nearest centroid to each data instance
 * (after empty clusters are filled), shape = [nInscances]
 * e.g. consider clustering a dataset with 4 data points into 3 clusters:
 * ```
 * distances = [
 *   [1, 2, 3, 4],
 *   [5, 6, 7, 8],
 *   [9, 10, 11, 12]
 * ],
 * ```
 * Before filling empty clusters, cluster assignment of all 4 data instances will be `0`,
 * since for all 4 data instances, centroid_0 is the nearest to them among the 3 centroids:
 * ```
 * mins = [0, 0, 0, 0]
 * ```
 * However we need to ensure cluster_1 and cluster_2 also have at least 1 data instance in them.
 * First for cluster_1, we mutate the cluster assignment of instance_0 from `0` to `1`,
 * because distnace between instances_0 and centroid_1 is `5`, smallest among all data instances:
 * ```
 * mins = [1, 0, 0, 0]
 * ```
 * Then for cluster_2, we mutate the cluster assignment of instance_1 from `0` to `2`,
 * because distnace between instances_1 and centroid_2 is `10`, smallest among
 * all data instances except for instances_0 (which has already been mutated in previous round):
 * ```
 * mins = [1, 2, 0, 0]
 * ```
 */
export function fillEmptyClusters(distances, minCount = 1) {
  return tf.tidy(() => {
    const nClusters = distances.shape[0];
    // mins: the IDs of centroid that's nearest to each data instance, shape = [nInscances]
    let mins = tf.argMin(distances, 0).toInt();
    let mutatedIds = tf.tensor([]);
    let count = 0;

    while (count < nClusters) {
      const clusterSampleCount = tf.sum(tf.oneHot(mins, nClusters), 0);
      const nEmptyClusters = tf.sum(
        tf.less(clusterSampleCount, tf.scalar(minCount)),
        0
      );
      // nEmptyClusters is a scalar, but `.dataSync()` returns an array with length = 1
      if (nEmptyClusters.dataSync()[0] <= 0) {
        return mins;
      }
      // tackle clusters one by one, starting from the smallest cluster
      const clusterToFill = tf.argMin(clusterSampleCount, 0).toInt();
      // dataIds that have already been mutated before should not be mutated again
      // set values at these indices to Infinity so they will not be picked by `argmin`
      const maskedDistances = assign(
        // only care about distances to the centroid of `clusterToFill`
        tf.squeeze(tf.gather(distances, clusterToFill)),
        mutatedIds,
        tf.scalar(Infinity)
      );

      // assign cluster K to data point P if P has shortest distance (among previously un-mutated data) to cluster K's center
      const dataIdToMutate = tf.argMin(maskedDistances, 0).reshape([1]);
      mutatedIds = tf.concat([mutatedIds, dataIdToMutate]);
      mins = assign(mins, dataIdToMutate, clusterToFill.reshape([1]));
      count++;
    }
    return mins;
  });
}

/**
 * assign `values` to positions indicated by `indices` in tensor `X`
 * @param {Tensor} X - the tensor to assign values to
 * @param {Tensor} indices - indices in `X` where value assignment should happen
 * @param {Tensor|Scalar} values - values to assign
 * @returns {Tensor} output tensor with values at `indices` substituted by `values`
 */
export function assign(X, indices, values) {
  return tf.tidy(() => {
    // todo: implement broadcasting logic
    if (indices.size === 0) {
      return X.clone();
    }
    let _values;
    // when `values` is a scalar
    if (indices.shape !== values.shape && values.rank === 0) {
      _values = tf.mul(tf.ones(indices.shape), values);
    } else {
      _values = values;
    }
    const correctVals = tf.scatterND(indices, _values, X.shape);
    const mask = tf
      .scatterND(indices, tf.ones(indices.shape), X.shape)
      .toBool();
    return tf.where(mask, correctVals, X);
  });
}

/**
 * Calculate the average value of all instances in each cluster.
 * @param {Tensor2D} samples - data input, shape = [nInstances, nDims]
 * @param {Tensor2D} nearestIndices - indices of centroid to each data instance, shape = [nInstances, nClusters]
 * @param {Number} nClusters
 * @returns {Tensor2D} centroids of all instances in each cluster, shape = [nClusters, nDims]
 */
export function updateCentroids(samples, nearestIndices, nClusters) {
  return tf.tidy(() => {
    const range = tf.range(0, nClusters).toInt();
    // mask.shape = [nSamples, nClusters]
    const mask = tf.equal(
      tf.expandDims(range, 0),
      tf.expandDims(nearestIndices, 1)
    );

    const expandedSamples = tf.expandDims(samples, 2);
    const expandedMask = tf.expandDims(mask, 1);
    const centroids = tf.div(
      // set all masked instances to 0 by multiplying the mask tensor, then sum across all instances
      tf.sum(tf.mul(expandedMask, expandedSamples), 0),
      // divided by number of instances
      tf.sum(mask, 0).toFloat()
    );
    // return.shape = [nClusters, nDims]
    return centroids.transpose();
  });
}
