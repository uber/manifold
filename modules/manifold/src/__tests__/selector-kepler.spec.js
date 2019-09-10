import {getAvailableVisualChannelFeatures} from '../selectors/kepler-selectors';

test('selector-kepler: getAvailableVisualChannelFeatures', () => {
  const geoFeatures = [
    {name: 'aggByFeature_0'},
    {
      name: 'otherGeoFeature_1',
      pair: [{name: 'otherGeoFeature_1_lat'}, {name: 'otherGeoFeature_1_lng'}],
    },
  ];
  const scoreData = {
    fields: [{name: '@score:model_0'}, {name: '@score:model_1'}],
  };
  const aggData = {
    aggByFeature_0: {
      fields: [
        {name: 'aggByFeature_0'},
        {name: '@score:model_0_mean'},
        {name: '@score:model_1_mean'},
      ],
    },
  };
  const visualChannelFeatures0 = getAvailableVisualChannelFeatures.resultFunc(
    true,
    geoFeatures,
    [0],
    scoreData,
    aggData
  );
  const visualChannelFeatures1 = getAvailableVisualChannelFeatures.resultFunc(
    true,
    geoFeatures,
    [1],
    scoreData,
    aggData
  );
  const visualChannelFeatures2 = getAvailableVisualChannelFeatures.resultFunc(
    false,
    [],
    [0],
    scoreData,
    aggData
  );
  expect(visualChannelFeatures0).toEqual([
    {name: '@score:model_0_mean'},
    {name: '@score:model_1_mean'},
  ]);
  expect(visualChannelFeatures1).toEqual([{name: 'groupId'}]);
  expect(visualChannelFeatures2).toEqual(null);
});
