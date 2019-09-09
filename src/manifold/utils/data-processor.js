import {
  computeModelsMeta,
  computeFeatureMeta,
  dotRange,
  logLoss,
  absoluteError,
} from 'packages/mlvis-common/utils';
import {UUID_NAME, FIELD_TYPE} from 'packages/mlvis-common/constants';
import {
  GROUND_TRUTH_NAME,
  predColName,
  scoreColName,
  makeUuid,
} from '../constants';

export const defaultInputDataTransformer = values => {
  return {
    x: values[0],
    yTrue: values.slice(1, -1),
    yPred: values[values.length - 1],
  };
};

/**
 * @param {Object} userData - {x: File, yPred: Array<File>, yTrue: File}
 * @return {Boolean}
 */
export function isDatasetIncomplete(userData) {
  const {x, yPred, yTrue} = userData;
  if (!x || !yPred || !yTrue || !yPred.length) {
    return true;
  }
  return false;
}

/**
 * check whether user input data is valid
 * @param {Object} data - {x: Array, yPred: Array<Array>, yTrue: Array}
 * @param {Boolean} relayError - decide whether to throw errors immediately
 * @return {Object | Array} -  returns the data when relayError option is off, otherwise, return a array of [Boolean, data]
 */
export function validateInputData(data, relayError) {
  const processError = e => {
    if (relayError) {
      return [false, e];
    } else {
      throw e;
    }
  };
  // todo: add tests
  const inputKeys = ['x', 'yTrue', 'yPred'];
  if (
    typeof data !== 'object' ||
    inputKeys.some(key => Object.keys(data).indexOf(key) < 0)
  ) {
    return processError(
      new Error('Input data must contain these keys: `x`, `yTrue`, `yPred`.')
    );
  }
  const {x, yTrue, yPred} = data;
  if (!x || !yTrue || !yPred || !x.length || !yTrue.length || !yPred.length) {
    return processError(
      new Error(
        'One or more required fields (`x`, `yTrue`, `yPred`) in input data is empty.'
      )
    );
  }
  const nInstances = x.length;
  if (yTrue.length !== nInstances || yPred.some(y => y.length !== nInstances)) {
    return processError(
      new Error(
        'Number of data instances in `x`, `yTrue` and `yPred` are not consistent. ' +
          'Check the shape of your input data.'
      )
    );
  }
  const predInstance0 = yPred[0][0];
  if (typeof predInstance0 !== 'object') {
    return processError(
      new Error(
        '`yPred` must be an array of array of objects. ' +
          'Check the shape of your input data.'
      )
    );
  }
  const predObjKeys = Object.keys(predInstance0);

  yPred.forEach((predArr, i) => {
    predArr.forEach((predEle, j) => {
      if (Object.keys(predEle).some(key => predObjKeys.indexOf(key) < 0)) {
        return processError(
          new Error(
            `yPred[${i}][${j}] has a different shape than other element in yPred.
          Check your input data.`
          )
        );
      }
    });
  });

  yTrue.forEach((trueEle, i) => {
    // regression
    if (predObjKeys.length === 1) {
      if (typeof yTrue[i] !== 'number') {
        return processError(
          new Error(
            `yTrue[${i}] has wrong data type. Check your input data.
          Expect: number, got: ${typeof yTrue[i]}`
          )
        );
      }
    }
    // classification
    else {
      if (predObjKeys.indexOf(String(trueEle)) < 0) {
        return processError(
          new Error(
            `Class label at yTrue[${i}] is not found in corresbonding yPred.
            Check your input data.`
          )
        );
      }
    }
  });
  return relayError ? [true, data] : data;
}

/**
 *
 * merge x, yPred, yTrue into one array of arrays; compute column metadata
 * @param {Array<Object>} x feature data, objects are rows, object keys are feature names
 * @param {Array<Array<Object>} yPred prediction data of multiple models, each sub array represent predictions from one model, each object has keys representing class names
 * @param {Array<Number|String>} yTrue ground truth
 * @param {Array<String>} classLabels
 * @return {Object} {data: {columns, fields}, collumnTypeRanges: {uuid, x, yPred, yTrue}}
 * columns: array of array of columns
 * fields: array of field metadata
 * collumnTypeRanges: map from "column type" (x, yPred, etc) to array of 2 elements indicating the start and end index of that column type in dataset
 */
export function getAllColumnsAndFields(x, yPred, yTrue, modelsMeta) {
  const {classLabels, nModels, nClasses} = modelsMeta;
  const {columns: columnsX, fields: fieldsX} = columnsAndFieldsFromX(x);
  const {
    columns: columnsYPred,
    fields: fieldsYPred,
  } = columnsAndFieldsFromYPred(yPred, classLabels);
  const {
    columns: columnsYTrue,
    fields: fieldsYTrue,
  } = columnsAndFieldsFromYTrue(yTrue);
  const {
    columns: columnsScore,
    fields: fieldsScore,
  } = columnsAndFieldsFromScore(columnsYPred, columnsYTrue, modelsMeta);

  const columns = [].concat.apply(
    [],
    [columnsX, columnsYPred, columnsYTrue, columnsScore]
  );
  const fields = [].concat.apply(
    [],
    [fieldsX, fieldsYPred, fieldsYTrue, fieldsScore]
  );

  // add a uuid column
  columns.unshift(dotRange(yTrue.length).map(makeUuid));
  fields.unshift({
    name: UUID_NAME,
    type: FIELD_TYPE.UUID,
    // todo: add consts for kepler data types
    dataType: 'string',
  });
  // reassign tableFieldIndex
  fields.forEach((f, i) => {
    f.tableFieldIndex = i + 1;
  });

  const numFeatures = fieldsX.length;
  const numPredCols = nModels * nClasses;
  return {
    data: {columns, fields},
    columnTypeRanges: {
      [UUID_NAME]: [0, 1],
      x: [1, numFeatures + 1],
      yPred: [numFeatures + 1, numFeatures + numPredCols + 1],
      yTrue: [numFeatures + numPredCols + 1, numFeatures + numPredCols + 2],
      score: [numFeatures + numPredCols + 2, columns.length],
    },
  };
}

/**
 *
 * get columns and fields from feature data
 * @param {Array<Object>} x feature data, objects are rows, object keys are feature names
 * @return {Object} {columns - array of array of columns; fields: array of field metadata} in the same order
 */
export function columnsAndFieldsFromX(x) {
  const columns = [];
  let fields = [];

  const xFieldNames = Object.keys(x[0]);
  xFieldNames.forEach(fieldName => {
    const featureData = x.map(row => row[fieldName]);
    const field = computeFeatureMeta(fieldName, featureData);
    if (field.type !== 'null') {
      columns.push(featureData);
      fields.push(computeFeatureMeta(fieldName, featureData));
    }
  });

  return {
    columns,
    fields,
  };
}

/**
 *
 * get columns and fields from prediction data
 * @param {Array<Array<Object>} yPred prediction data of multiple models, each sub array represent predictions from one model, each object has keys representing class names
 * @param {Array<String>} classLabels
 * @return {Object} {columns - array of array of columns; fields: array of field metadata} in the same order
 */
export function columnsAndFieldsFromYPred(yPred, classLabels) {
  const columns = [];
  const fields = [];

  // `classLabels` passed as argument can ensure correct order
  const _classLabels = classLabels || Object.keys(yPred[0][0]);

  yPred.forEach((singleModelPredArr, modelId) => {
    _classLabels.forEach((classCol, classId) => {
      const name = predColName(modelId, classId);
      columns.push(singleModelPredArr.map(predObj => predObj[classCol]));
      fields.push({
        name,
        type: FIELD_TYPE.PREDICTION,
        dataType: 'float',
      });
    });
  });
  return {
    columns,
    fields,
  };
}

/**
 *
 * get columns and fields from ground truth data
 * @param {Array<Number|String>} yTrue ground truth
 * @return {Object} {columns - array of array of columns; fields: array of field metadata} in the same order
 */
export function columnsAndFieldsFromYTrue(yTrue) {
  return {
    columns: [yTrue],
    fields: [
      {
        name: GROUND_TRUTH_NAME,
        type: FIELD_TYPE.GROUND_TRUTH,
        dataType: typeof yTrue[0] === 'string' ? 'string' : 'float',
      },
    ],
  };
}

/**
 * compute model score columns given yPred, yTrue columns
 * @param {Array<Array<Number|String>} yPred prediction columns, from all models and all classes
 * @param {Array<Array<Number|String>} yTrue ground truth columns
 * @param {Object} modelMeta contains {nModels, nClasses, classLabels}
 * @param {scoreFunc} function to compute score
 * @return {Object} {data: {columns, fields}, collumnTypeRanges: {uuid, x, yPred, yTrue}}
 * columns: array of field metadata
 * fields: array of array of columns
 */
export function columnsAndFieldsFromScore(
  columnsYPred,
  columnsYTrue,
  modelsMeta,
  scoreFunc
) {
  const {nModels, nClasses, classLabels = []} = modelsMeta;

  // regression vs classification
  const _scoreFunc =
    scoreFunc && typeof scoreFunc === 'function'
      ? scoreFunc
      : nClasses === 1
      ? absoluteError
      : logLoss;

  // performance columns by model
  const columns = dotRange(nModels).map(modelId => {
    // get prediction columns by model
    const predictArr = columnsYPred.slice(
      modelId * nClasses,
      (modelId + 1) * nClasses
    );
    return _scoreFunc(columnsYTrue[0], predictArr, classLabels);
  });
  const fields = dotRange(nModels).map(modelId => ({
    name: scoreColName(modelId),
    type: FIELD_TYPE.SCORE,
    dataType: 'float',
  }));

  return {
    columns,
    fields,
  };
  // 17924.6ms --> 112.77ms
}

/**
 * @param {Object} userData - {x: File, yPred: Array<File>, yTrue: File}
 * @return {Object} {data, modelsMeta}
 */
export const computeMetaData = ({x, yPred, yTrue}) => {
  const modelsMeta = computeModelsMeta(yPred);
  const {data, columnTypeRanges} = getAllColumnsAndFields(
    x,
    yPred,
    yTrue,
    modelsMeta
  );

  return {
    data,
    modelsMeta,
    columnTypeRanges,
  };
};
