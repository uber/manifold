// @noflow
import {loadLocalData} from '@uber/manifold/actions';

export const UPDATE_VIEWPORT = 'UPDATE_VIEWPORT';

export const loadManifoldData = fileList =>
  loadLocalData({
    fileList,
    dataTransformer,
  });

export const dataTransformer = values => {
  // convert data from Michelangelo format to Manifold format
  // Michelangelo format: one csv file per model, each contains features and predictions
  // Manifold format: one prediction csv per model, plus one additional feature csv for all models
  const fieldsList = values.map(v => v.fields);
  const dataList = values.map(v => v.data);
  const featureFieldsList = dedupFields(fieldsList.map(featureFields));
  const featureData = joinFields(featureFieldsList, dataList);
  const predFieldsList = fieldsList.map(predFields);
  const predData = predFieldsList.map((fields, modelId) => {
    return selectFields(fields, dataList[modelId]);
  });
  return {
    featureData,
    predData,
  };
};

// fields in michelangelo csvs that are not needed in manifold
const EXTRA_FIELDS = ['_RowIndex', '_model_id', '_project_id', '_predicted_at'];
const PRED_FIELDS = [
  '@prediction:predict',
  '@prediction:target',
  '@prediction:true',
  '@prediction:false',
];

function featureFields(fields) {
  return fields.filter(
    field => field.startsWith('@derived:') && !EXTRA_FIELDS.includes(field)
  );
}

function predFields(fields) {
  return fields.filter(field => PRED_FIELDS.includes(field));
}

/*
 * Only retain a field in `data` if it first appears in `fields`
 * @example
 * // returns [{'field1': 1, 'field2': 2}]
 * selectFields(['field1', 'field2'], [{'field1': 1, 'field2': 2, 'field3': 3}]);
 * @param: {String[]} fields
 * @param: {Object[]} data
 * @return: {Object[]} a list of data, fields or each item are filtered based on `fields`
 */
function selectFields(fields, data) {
  return data.map(dataPoint =>
    fields.reduce((acc, field) => {
      acc[field] = dataPoint[field];
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
