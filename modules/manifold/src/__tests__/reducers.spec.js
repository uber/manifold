import {FEATURE_TYPE} from 'packages/mlvis-common/constants';
import {DEFAULT_STATE, handleUpdateFeatureTypes} from '../reducers';

test('reducer: handleUpdateFeatureTypes', () => {
  const state1 = handleUpdateFeatureTypes(DEFAULT_STATE, {
    payload: {
      [FEATURE_TYPE.CATEGORICAL]: ['feature0'],
      [FEATURE_TYPE.GEO]: ['feature1'],
    },
  });
  expect(state1.featureTypes).toEqual({
    [FEATURE_TYPE.CATEGORICAL]: ['feature0'],
    [FEATURE_TYPE.NUMERICAL]: [],
    [FEATURE_TYPE.GEO]: ['feature1'],
  });

  expect(state1).not.toBe(DEFAULT_STATE);
  Object.keys(state1).forEach(k => {
    if (k !== 'featureTypes') {
      expect(state1[k]).toBe(DEFAULT_STATE[k]);
    } else {
      expect(state1[k]).not.toBe(DEFAULT_STATE[k]);
    }
  });
});
