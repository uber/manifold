// todo: add tests to this file
import {UUID_NAME} from 'packages/mlvis-common/constants';
import {makeUuid} from '../constants';
import {transposeData} from 'packages/mlvis-common/utils';
import {
  KEPLER_GL_VERSION,
  FILTER_TYPES,
  LAYER_TYPES,
  HEATMAP_COLORS,
  DIVERGING_COLORS,
  KEPLER_DATASET_NAME,
} from '../constants/kepler-constants';

/**
 * transform manifold dataset to kepler-compatible format
 * @param {Object} data manifold dataset with {columns, fields}
 * @param {String} id kepler dataset id
 */
export function transformDatasetForKepler(data, id) {
  const {fields, columns} = data;
  // field name in `fields` is 'dataType' instead of 'type'
  const _fields = fields.map(d => ({
    ...d,
    type: d.dataType,
  }));
  const rows = transposeData(columns);

  // duplicate datasets since no per-layer filtering is supported T3638323 https://github.com/keplergl/kepler.gl/issues/403
  // todo: do not limit to only 2 datasets
  return {
    info: {id},
    data: {fields: _fields, rows},
  };
}

/**
 *
 * @param {Array<Array<Number>>} idsInSegmentgroups array of 2 arrays of row ids, representing data points in 2 segment groups
 * @param {Array<Object>} geoFeatures geo feature definitions, contains {name, pair}. geoFeatures.pair is an array of 2 geo feature definitions representing lat, lng columns of that feature
 * @param {Array<Boolean>} isVisible whether each geo feature is visible
 * @returns kepler config
 */
export function getKeplerConfigUtil(
  idsInSegmentgroups,
  geoFeatures,
  isVisible,
  colorByFeature
) {
  const layers = getKeplerLayers(
    idsInSegmentgroups,
    geoFeatures,
    isVisible,
    colorByFeature
  );
  const filters = getKeplerFiltersByRowId(idsInSegmentgroups);
  return {
    version: KEPLER_GL_VERSION,
    config: {
      visState: {
        filters,
        layers,
        layerBlending: 'normal',
        splitMaps: [],
      },
    },
  };
}

/**
 *
 * @param {Array<Array<Number>>} idsInSegmentgroups array of 2 arrays of row ids, representing data points in 2 segment groups
 * @param {Array<Object>} geoFeatures geo feature definitions, contains {name, pair}. geoFeatures.pair is an array of 2 geo feature definitions representing lat, lng columns of that feature
 * @param {Array<Boolean>} isVisible whether each geo feature is visible
 * @param {Object} colorByFeature field definition by which to color visual layers, contains {name, type, tableFieldIndex}
 * @returns layer field of kepler config
 */
export function getKeplerLayers(
  idsInSegmentgroups,
  geoFeatures,
  isVisible,
  colorByFeature
) {
  // iterate each feature
  const layersInfoNested = geoFeatures.map((geoFeatureDef, geoFeatureId) => {
    // no need to create 2 layers if this is an agregated layer
    if (!geoFeatureDef.pair) {
      return {
        geoFeatureDef,
        geoFeatureId,
      };
    }
    // iterate each segment groups since no per-layer filtering is supported T3638323 https://github.com/keplergl/kepler.gl/issues/403
    return idsInSegmentgroups.map((dataIds, segmentGroupId) => {
      return {
        geoFeatureDef,
        geoFeatureId,
        numDataPoints: dataIds.length,
        segmentGroupId,
      };
    });
  });
  // flatten
  const layersInfo = [].concat.apply([], layersInfoNested);

  return layersInfo.map(info => {
    const {geoFeatureDef, geoFeatureId, numDataPoints, segmentGroupId} = info;

    const layerSuffix = segmentGroupId
      ? `group_${segmentGroupId}`
      : 'aggregated';
    const layerId = `${geoFeatureDef.name}_${layerSuffix}`;
    const type = getLayerType(geoFeatureDef);
    // if this is hexagonId layer, point to the aggregated dataset
    const dataId =
      type === 'hexagonId'
        ? `${KEPLER_DATASET_NAME}_hex_${geoFeatureDef.name}`
        : `${KEPLER_DATASET_NAME}_${segmentGroupId}`;
    const columns = getLayerColumns(geoFeatureDef, type);
    const visualChannels = getLayerVisualChannels(type, colorByFeature);
    const visConfig = getLayerVisConfig(type, numDataPoints, segmentGroupId);

    return {
      id: layerId,
      type,
      config: {
        dataId,
        label: layerId,
        columns,
        isVisible: isVisible[geoFeatureId],
        visConfig,
      },
      visualChannels,
    };
  });
}

/**
 *
 * @param {Array<Array<Number>>} idsInSegmentgroups array of 2 arrays of row ids, representing data points in 2 segment groups
 * @returns {Array<Objects>} filter field of kepler config
 */
export function getKeplerFiltersByRowId(idsInSegmentgroups) {
  return idsInSegmentgroups.map((dataIds, segmentGroupId) => ({
    dataId: `${KEPLER_DATASET_NAME}_${segmentGroupId}`,
    id: `filter_${segmentGroupId}`,
    name: UUID_NAME,
    type: FILTER_TYPES.multiSelect,
    value: dataIds.map(makeUuid),
  }));
}

/**
 *
 * @param {Array<Object>} geoFeatures geo feature definitions, contains {name, pair}. geoFeatures.pair is an array of 2 geo feature definitions representing lat, lng columns of that feature
 * @returns {String} layer type field of kepler config
 */
export function getLayerType(geoFeatureDef) {
  return geoFeatureDef.pair ? LAYER_TYPES.heatmap : LAYER_TYPES.hexagonId;
}

export function getLayerColumns(geoFeatureDef, layerType) {
  const _layerType = layerType || getLayerType(geoFeatureDef);
  const {
    name: fieldColName,
    pair: [{name: latCol}, {name: lngCol}] = [{}, {}],
  } = geoFeatureDef;
  return _layerType === LAYER_TYPES.hexagonId
    ? {hex_id: fieldColName}
    : {
        lat: latCol,
        lng: lngCol,
      };
}

/**
 *
 * @param {String} layerType kepler layer type
 * @param {Number} numDataPoints number of datapoints in a layer (post filtering)
 * @param {Number} segmentGroupId 0 or 1, which segment group this layer represents
 * @returns visConfig field of kepler config
 */
export function getLayerVisConfig(layerType, numDataPoints, segmentGroupId) {
  let colors;
  switch (layerType) {
    case 'heatmap':
      colors = HEATMAP_COLORS[segmentGroupId];
      break;
    case 'hexagonId':
      colors = DIVERGING_COLORS;
      break;
  }
  let opacity;
  switch (layerType) {
    case 'heatmap':
      opacity = 0.8;
      break;
    case 'hexagonId':
      opacity = 0.5;
      break;
  }
  return {
    opacity,
    colorRange: {
      colors,
    },
    radius: 10,
  };
}

/**
 *
 * @param {String} layerType kepler layer type
 * @param {Object} colorByFeature field definition by which to color visual layers, contains {name, type, tableFieldIndex}
 * @returns visualChannels field of kepler config
 */
export function getLayerVisualChannels(layerType, colorByFeature) {
  // todo: derive default visual channels from layerType
  switch (layerType) {
    case 'heatmap':
      return {
        weightField: null,
        weightScale: 'linear',
      };
    case 'hexagonId':
      return {
        colorField: {
          name: colorByFeature.name,
        },
        colorScale: 'quantize',
      };
  }
}
