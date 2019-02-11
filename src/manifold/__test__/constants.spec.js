// @noflow
import {CLASS_LABELS} from '../constants';

test('constants: CLASS_LABELS', () => {
  const columns1 = ['@prediction:predict', '@prediction:target'];
  const columns2 = [
    '@prediction:class1',
    '@prediction:class2',
    '@prediction:class3',
    '@prediction:target',
  ];
  expect(CLASS_LABELS(columns1)).toEqual([]);
  expect(CLASS_LABELS(columns2)).toEqual(['class1', 'class2', 'class3']);
});
