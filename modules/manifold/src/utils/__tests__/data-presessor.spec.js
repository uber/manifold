import {
  getAllColumnsAndFields,
  columnsAndFieldsFromX,
  columnsAndFieldsFromYPred,
  columnsAndFieldsFromYTrue,
  columnsAndFieldsFromScore,
} from '../utils/data-processor';
import {predColName, scoreColName, GROUND_TRUTH_NAME} from '../constants';
import {
  FEATURE_TYPE,
  UUID_NAME,
  FIELD_ROLE,
  DATA_TYPE,
} from '@mlvis/mlvis-common/constants';

test('data-processor: getAllColumnsAndFields', () => {
  const x = [{a: 5, b: 'a'}, {a: 3, b: 'b'}];
  const yPred = [[{classA: 0.1, classB: 0.3}, {classA: 0.5, classB: 0.7}]];
  const yTrue = ['classA', 'classB'];
  const meta = {
    nModels: 1,
    nClasses: 2,
    classLabels: ['classA', 'classB'],
  };
  const {
    data: {columns, fields},
    columnTypeRanges,
  } = getAllColumnsAndFields(x, yPred, yTrue, meta);
  expect(columns).toMatchObject([
    ['uuid0', 'uuid1'],
    [5, 3],
    ['a', 'b'],
    [0.1, 0.5],
    [0.3, 0.7],
    ['classA', 'classB'],
    {},
  ]);
  expect(fields).toMatchObject([
    {name: UUID_NAME, tableFieldIndex: 1},
    {name: 'a', tableFieldIndex: 2},
    {name: 'b', tableFieldIndex: 3},
    {name: predColName(0, 0), tableFieldIndex: 4},
    {name: predColName(0, 1), tableFieldIndex: 5},
    {name: GROUND_TRUTH_NAME, tableFieldIndex: 6},
    {name: scoreColName(0), tableFieldIndex: 7},
  ]);
  expect(columnTypeRanges).toEqual({
    [UUID_NAME]: [0, 1],
    x: [1, 3],
    yPred: [3, 5],
    yTrue: [5, 6],
    score: [6, 7],
  });
});

test('data-processor: columnsAndFieldsFromX', () => {
  const x = [
    {a: 5, b: 'a'},
    {a: 3, b: 'b'},
    {a: 1, b: 'c'},
    {a: 4, b: 'd'},
    {a: 2, b: 'e'},
  ];
  const {columns, fields} = columnsAndFieldsFromX(x);
  expect(columns).toEqual([[5, 3, 1, 4, 2], ['a', 'b', 'c', 'd', 'e']]);
  expect(fields).toMatchObject([
    {name: 'a', type: FEATURE_TYPE.NUMERICAL, dataType: 'integer'},
    {name: 'b', type: FEATURE_TYPE.CATEGORICAL, dataType: 'string'},
  ]);
});

test('data-processor: columnsAndFieldsFromYPred', () => {
  const yPred = [
    [{classA: 0.1, classB: 0.3}, {classA: 0.5, classB: 0.7}],
    [{classA: 0.2, classB: 0.4}, {classA: 0.6, classB: 0.8}],
  ];
  const {columns, fields} = columnsAndFieldsFromYPred(yPred, [
    'classA',
    'classB',
  ]);
  expect(columns).toEqual([[0.1, 0.5], [0.3, 0.7], [0.2, 0.6], [0.4, 0.8]]);
  expect(fields).toMatchObject([
    {
      name: predColName(0, 0),
      type: FEATURE_TYPE.NUMERICAL,
      role: FIELD_ROLE.PREDICTION,
      dataType: DATA_TYPE.REAL,
    },
    {
      name: predColName(0, 1),
      type: FEATURE_TYPE.NUMERICAL,
      role: FIELD_ROLE.PREDICTION,
      dataType: DATA_TYPE.REAL,
    },
    {
      name: predColName(1, 0),
      type: FEATURE_TYPE.NUMERICAL,
      role: FIELD_ROLE.PREDICTION,
      dataType: DATA_TYPE.REAL,
    },
    {
      name: predColName(1, 1),
      type: FEATURE_TYPE.NUMERICAL,
      role: FIELD_ROLE.PREDICTION,
      dataType: DATA_TYPE.REAL,
    },
  ]);
});

test('data-processor: columnsAndFieldsFromYTrue', () => {
  const yTrue = [1, 2, 3, 4, 5];
  const {columns, fields} = columnsAndFieldsFromYTrue(yTrue);
  expect(columns).toEqual([[1, 2, 3, 4, 5]]);
  expect(fields).toMatchObject([
    {
      name: GROUND_TRUTH_NAME,
      type: FEATURE_TYPE.CATEGORICAL,
      role: FIELD_ROLE.GROUND_TRUTH,
      dataType: DATA_TYPE.INTEGER,
    },
  ]);
});

test('data-processor: columnsAndFieldsFromScore', () => {
  const yPred1 = [[10], [30]];
  const yTrue1 = [[20]];
  const meta1 = {
    nModels: 2,
    nClasses: 1,
    classLabels: ['predict'],
  };
  const {columns: c1, fields: f1} = columnsAndFieldsFromScore(
    yPred1,
    yTrue1,
    meta1
  );
  expect(c1.length).toBe(2);
  expect(c1[0].length).toBe(1);
  expect(f1).toMatchObject([
    {
      name: scoreColName(0),
      type: FEATURE_TYPE.NUMERICAL,
      role: FIELD_ROLE.SCORE,
      dataType: DATA_TYPE.REAL,
    },
    {
      name: scoreColName(1),
      type: FEATURE_TYPE.NUMERICAL,
      role: FIELD_ROLE.SCORE,
      dataType: DATA_TYPE.REAL,
    },
  ]);
  const yPred2 = [[0.1, 0.6], [0.5, 0.3], [0.4, 0.1]];
  const yTrue2 = [['cat2', 'cat1']];
  const meta2 = {
    nModels: 1,
    nClasses: 3,
    classLabels: ['cat1', 'cat2', 'cat3'],
  };
  const {columns: c2, fields: f2} = columnsAndFieldsFromScore(
    yPred2,
    yTrue2,
    meta2
  );
  expect(c2.length).toBe(1);
  expect(c2[0].length).toBe(2);
  expect(f2).toMatchObject([
    {
      name: scoreColName(0),
      type: FEATURE_TYPE.NUMERICAL,
      role: FIELD_ROLE.SCORE,
      dataType: DATA_TYPE.REAL,
    },
  ]);
});
