// @noflow
import {loadLocalData} from '@mlvis/manifold/actions';

export const UPDATE_VIEWPORT = 'UPDATE_VIEWPORT';

export const loadMAData = fileList =>
  loadLocalData({
    fileList,
    dataTransformer: michelangeloDataTransformer,
  });

export const michelangeloDataTransformer = values => {
  // convert data from Michelangelo format to Manifold format
  // Michelangelo format: one csv file per model, each contains features and predictions
  // Manifold format: one prediction csv per model, plus one additional feature csv for all models
  const fieldsList = values.map(v => v.fields);
  const dataList = values.map(v => v.data);
  const featureFieldsList = dedupFields(fieldsList.map(featureFields));
  const featureData = joinFields(featureFieldsList, dataList);
  const predFieldsList = fieldsList.map(predFields);
  const predData = predFieldsList.map((fields, modelId) => {
    const renameField = f => f.split(':')[1];
    return selectFields(fields, dataList[modelId], renameField);
  });
  const targetData = dataList[0].map(d =>
    typeof d[TARGET_FIELD] !== 'number'
      ? String(d[TARGET_FIELD]).toLowerCase()
      : d[TARGET_FIELD]
  );
  return {
    x: featureData,
    yPred: predData,
    yTrue: targetData,
  };
};

// -------------------- helper functions of `maDataTransformer`-----------------------

// fields in michelangelo csvs that are not needed in manifold
const EXTRA_FIELDS = ['_RowIndex', '_model_id', '_project_id', '_predicted_at'];
const PRED_FIELDS_REGRESSION = ['@prediction:predict'];
const PRED_FIELDS_BINARY = ['@prediction:true', '@prediction:false'];
const TARGET_FIELD = '@prediction:target';

function featureFields(fields) {
  return fields.filter(
    field => field.startsWith('@derived:') && !EXTRA_FIELDS.includes(field)
  );
}

function predFields(fields) {
  // todo: better filtering of prediction fields to allow multi-class
  const fieldsSet = new Set(fields);
  if (PRED_FIELDS_BINARY.every(field => fieldsSet.has(field))) {
    return PRED_FIELDS_BINARY;
  }
  return PRED_FIELDS_REGRESSION;
}

/*
 * Only retain a field in `data` if it first appears in `fields`
 * @example
 * // returns [{'field1': 1, 'field2': 2}]
 * selectFields(['field1', 'field2'], [{'field1': 1, 'field2': 2, 'field3': 3}]);
 * @param: {String[]} fields
 * @param: {Object[]} data
 * @param: {Function} transformer of field name into target object field name
 * @return: {Object[]} a list of data, fields or each item are filtered based on `fields`
 */
function selectFields(fields, data, renameField) {
  return data.map(dataPoint =>
    fields.reduce((acc, field) => {
      acc[renameField(field)] = dataPoint[field];
      return acc;
    }, {})
  );
}

/*
 * Only retain a field if it first appears in the current modelId
 * @example
 * dedupFields([['field1', 'field2', 'field3'], ['field2']]); // returns [['field1', 'field2', 'field3'], []]
 * @param {String[][]} fieldsList
 * @returns {String[][]} de-dupped field names
 */
function dedupFields(fieldsList) {
  const featureFieldsMap = {};
  const outputList = fieldsList.map(() => []);
  fieldsList.forEach((fields, modelId) => {
    fields.forEach(field => {
      if (!featureFieldsMap[field]) {
        featureFieldsMap[field] = true;
        outputList[modelId].push(field);
      }
    });
  });
  return outputList;
}

/*
 * Horizontally join several data matrices, keep column names from `fieldsList`
 * @param: {String[][]} fieldsList: dedupped feature field names
 * @param: {Object[][]} data: data with original fields
 * @return: {Object[]} a merged list of data, field names are taken from `fieldsList`
 */
function joinFields(fieldsList, data = [[]]) {
  const nDataPoints = data[0].length;
  const output = [];
  for (let dataId = 0; dataId < nDataPoints; dataId++) {
    const dataPoint = fieldsList.reduce((acc, fields, modelId) => {
      fields.forEach(field => {
        acc[field] = data[modelId][dataId][field];
      });
      return acc;
    }, {});
    output.push(dataPoint);
  }
  return output;
}
