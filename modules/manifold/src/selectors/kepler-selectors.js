import {createSelector} from 'reselect';
import {getDisplayGeoFeatures, getColorByFeature} from './base';
import {
  getData,
  getX,
  getScore,
  getColumnTypeRanges,
  getDataIdsInSegmentGroups,
} from './compute';
import {dotRange, mean} from 'packages/mlvis-common/utils';
import {FEATURE_TYPE} from 'packages/mlvis-common/constants';

import {groupLatLngPairs, aggregateDataset, concatDataset} from '../utils';
import {
  transformDatasetForKepler,
  getKeplerConfigUtil,
} from '../utils/kepler-utils';
import {KEPLER_DATASET_NAME} from '../constants/kepler-constants';

export const getGroupedGeoFeatures = createSelector(
  getX,
  x => {
    if (!x) {
      return null;
    }
    const {fields} = x;
    const geoFields = fields.filter(
      feature => feature.type === FEATURE_TYPE.GEO
    );
    return groupLatLngPairs(geoFields);
  }
);

export const getHasGeoFeatures = createSelector(
  getGroupedGeoFeatures,
  geoFeatures => Boolean(geoFeatures && geoFeatures.length)
);

export const getLayerVisibility = createSelector(
  [getHasGeoFeatures, getGroupedGeoFeatures, getDisplayGeoFeatures],
  (hasGeoFeatures, geoFeatures, displayGeoFeatures) => {
    if (!hasGeoFeatures) {
      return null;
    }
    return geoFeatures.map((f, i) =>
      displayGeoFeatures.includes(i) ? true : false
    );
  }
);

export const getTempDatasetWithSegmentGroupIds = createSelector(
  [getHasGeoFeatures, getData, getDataIdsInSegmentGroups],
  (hasGeoFeatures, data, idInGroups) => {
    const {columns} = data;
    if (!hasGeoFeatures || !columns || !idInGroups || !columns.length) {
      return null;
    }
    // transform a grouped id array to an indicator array
    const idCol = Array(columns[0].length);
    idInGroups.forEach((idArr, groupId) =>
      idArr.forEach(id => (idCol[id] = groupId))
    );
    // append idInGroups as a temp column to do aggregation
    return concatDataset([
      data,
      {
        fields: [{name: 'groupId'}],
        columns: [idCol],
      },
    ]);
  }
);

// precompute aggregated datasets by hexId features, returns a map of datasets keyed by "aggregateBy" feature names
export const getAggregatedDataset = createSelector(
  [
    getHasGeoFeatures,
    getTempDatasetWithSegmentGroupIds,
    getColumnTypeRanges,
    getGroupedGeoFeatures,
  ],
  (hasGeoFeatures, data, columnTypeRanges, geoFeatures) => {
    if (!hasGeoFeatures || !data) {
      return null;
    }
    const {fields} = data;
    // aggregate by hexId if there are hexId features.
    // todo: the aggregation logic can possibly happen within kepler
    const hexFeatures = geoFeatures.filter(feature => !feature.pair);

    // include score columns and the last column (groupId column)
    const columnsToInclude = dotRange(...columnTypeRanges.score).concat([
      fields.length - 1,
    ]);
    // only compute mean for score columns and count for groupId column
    const aggregateFuncs = dotRange(...columnTypeRanges.score).reduce(
      (acc, colId) => {
        acc[fields[colId].name] = [{name: 'mean', func: mean}];
        return acc;
      },
      {}
    );
    aggregateFuncs['groupId'] = [
      {name: () => 'group0 percentage', func: arr => 1 - mean(arr)},
      {name: () => 'total count', func: arr => arr.length},
    ];
    const keplerHexDatasets = hexFeatures.reduce((acc, hexFeature) => {
      acc[hexFeature.name] = aggregateDataset(
        data,
        hexFeature,
        aggregateFuncs,
        columnsToInclude
      );
      return acc;
    }, {});
    return keplerHexDatasets;
  }
);

// return a list of fields indicating available features for coloring the map based on current dataset.
export const getAvailableVisualChannelFeatures = createSelector(
  [
    getHasGeoFeatures,
    getGroupedGeoFeatures,
    getDisplayGeoFeatures,
    getScore,
    getAggregatedDataset,
  ],
  (hasGeoFeatures, geoFeatures, displayGeoFeatures, scoreData, aggData) => {
    if (!hasGeoFeatures || !displayGeoFeatures || !scoreData || !aggData) {
      return null;
    }
    const displayFeature = geoFeatures[displayGeoFeatures[0]];
    const availableFields = displayFeature.pair
      ? // if only showing points, default to color by GroupId
        [{name: 'groupId'}]
      : // exclude uuid or aggregate-by columns
        aggData[displayFeature.name].fields.slice(1);
    return availableFields;
  }
);

export const getKeplerDatasets = createSelector(
  [getHasGeoFeatures, getData, getGroupedGeoFeatures, getAggregatedDataset],
  (hasGeoFeatures, data, geoFeatures, aggregatedData) => {
    const {fields} = data;
    if (!hasGeoFeatures || !fields || !aggregatedData) {
      return null;
    }
    // duplicate datasets since no per-layer filtering is supported T3638323 https://github.com/keplergl/kepler.gl/issues/403
    const keplerDatasets = [0, 1].map(groupId =>
      transformDatasetForKepler(data, `${KEPLER_DATASET_NAME}_${groupId}`)
    );
    const keplerHexDatasets = Object.keys(aggregatedData).map(featureName =>
      transformDatasetForKepler(
        aggregatedData[featureName],
        `${KEPLER_DATASET_NAME}_hex_${featureName}`
      )
    );
    return keplerDatasets.concat(keplerHexDatasets);
  }
);

export const getSelectedColorByFeature = createSelector(
  [getHasGeoFeatures, getAvailableVisualChannelFeatures, getColorByFeature],
  (hasGeoFeatures, visualChannelFeatures, colorByFeature) => {
    if (
      !hasGeoFeatures ||
      !visualChannelFeatures ||
      !visualChannelFeatures.length
    ) {
      return null;
    }
    // if user selects a `colorByFeature` id based on previous `visualChannelFeatures` array, and then `visualChannelFeatures` changes, this might happen
    // since `colorByFeature` comes from state and `visualChannelFeatures` comes from selector. Todo: manage both states in redux
    if (colorByFeature >= visualChannelFeatures.length) {
      return visualChannelFeatures[0];
    }
    return visualChannelFeatures[colorByFeature];
  }
);

export const getKeplerConfig = createSelector(
  [
    getHasGeoFeatures,
    getDataIdsInSegmentGroups,
    getGroupedGeoFeatures,
    getLayerVisibility,
    getSelectedColorByFeature,
  ],
  (
    hasGeoFeatures,
    idsInSegmentgroups,
    geoFeatures,
    isVisible,
    colorByFeature
  ) => {
    if (
      !hasGeoFeatures ||
      !idsInSegmentgroups ||
      !isVisible ||
      !colorByFeature
    ) {
      return null;
    }
    // todo: part of the arguments here like `isVisible`, `colorByFeature` if changed, we don't need to derive the entire config all over again. Try use kepler actions
    return getKeplerConfigUtil(
      idsInSegmentgroups,
      geoFeatures,
      isVisible,
      colorByFeature
    );
  }
);
