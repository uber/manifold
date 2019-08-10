import Processors from 'kepler.gl/processors';
import {selectFields, zipObjects} from '../utils';
import {computeModelsMeta, computeFeaturesMeta} from 'packages/mlvis-common/utils';

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
 * @return {Boolean}
 */
export function validateInputData(data) {
  // todo: add tests
  const inputKeys = ['x', 'yTrue', 'yPred'];
  if (
    typeof data !== 'object' ||
    inputKeys.some(key => Object.keys(data).indexOf(key) < 0)
  ) {
    throw new Error(
      'Input data must contain these keys: `x`, `yTrue`, `yPred`.'
    );
  }
  const {x, yTrue, yPred} = data;
  if (!x || !yTrue || !yPred || !x.length || !yTrue.length || !yPred.length) {
    throw new Error(
      'One or more required fields (`x`, `yTrue`, `yPred`) in input data is empty.'
    );
  }
  const nInstances = x.length;
  if (yTrue.length !== nInstances || yPred.some(y => y.length !== nInstances)) {
    throw new Error(
      'Number of data instances in `x`, `yTrue` and `yPred` are not consistent. ' +
        'Check the shape of your input data.'
    );
  }
  const predInstance0 = yPred[0][0];
  if (typeof predInstance0 !== 'object') {
    throw new Error(
      '`yPred` must be an array of array of objects. ' +
        'Check the shape of your input data.'
    );
  }
  const predObjKeys = Object.keys(predInstance0);

  yPred.forEach((predArr, i) => {
    predArr.forEach((predEle, j) => {
      if (Object.keys(predEle).some(key => predObjKeys.indexOf(key) < 0)) {
        throw new Error(
          `yPred[${i}][${j}] has a different shape than other element in yPred.
          Check your input data.`
        );
      }
    });
  });

  yTrue.forEach((trueEle, i) => {
    // regression
    if (predObjKeys.length === 1) {
      if (typeof yTrue[i] !== 'number') {
        throw new Error(
          `yTrue[${i}] has wrong data type. Check your input data.
          Expect: number, got: ${typeof yTrue[i]}`
        );
      }
    }
    // classification
    else {
      if (predObjKeys.indexOf(trueEle) < 0) {
        throw new Error(
          `Class label at yTrue[${i}] is not found in corresbonding yPred.
            Check your input data.`
        );
      }
    }
  });
  return data;
}

export const computeMetaData = ({x, yPred, yTrue}) => {
  const featuresMeta = computeFeaturesMeta(x);
  const validFeatures = selectFields(featuresMeta.map(f => f.name), x);
  // TODO: converting feature data to array of arrays instead of array of objects could happen earlier (during CSV parsing).
  const {fields, rows} = Processors.processRowObject(validFeatures);
  // both `fields` (for kepler) and `featuresMeta` have key "type". Rename that of `fields` to "dataType"
  const renameFields = [{type: 'dataType'}, {}];

  return {
    x: rows,
    yPred,
    yTrue,
    modelsMeta: computeModelsMeta(yPred),
    featuresMeta: zipObjects([fields, featuresMeta], 'name', renameFields),
  };
};
