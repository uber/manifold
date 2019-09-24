import assert from 'assert';
import {METRIC, METRIC_OPTIONS, MODEL_TYPE} from '../constants';
import {
  FEATURE_TYPE,
  FILTER_TYPE,
  FIELD_ROLE,
} from '@mlvis/mlvis-common/constants';
import {dotRange} from '@mlvis/mlvis-common/utils';
import {product} from './utils';

//---------Metric----------//

export const defaultMetric = state => {
  const {
    modelsMeta: {nClasses},
  } = state;
  assert(nClasses > 0, '`nClasses` must be larger than 0');
  return nClasses >= 2 ? METRIC.LOG_LOSS : METRIC.ABSOLUTE_ERROR;
};

export const isValidMetric = state => {
  const {
    metric,
    modelsMeta: {nClasses},
  } = state;
  assert(nClasses > 0, '`nClasses` must be larger than 0');
  const modelType =
    nClasses === 1
      ? MODEL_TYPE.REGRESSION
      : nClasses === 2
      ? MODEL_TYPE.BIN_CLASS
      : MODEL_TYPE.MULT_CLASS;
  return METRIC_OPTIONS[modelType].includes(metric);
};

//---------BaseCols----------//

export const defaultBaseCols = state => {
  const {columnTypeRanges} = state;
  assert(
    columnTypeRanges.score && columnTypeRanges.score.length == 2,
    '`columnTypeRanges.score` must contain 2 elements'
  );
  return dotRange(...columnTypeRanges.score);
};

export const isValidBaseCols = state => {
  const {
    data: {fields},
    baseCols,
  } = state;
  assert(fields.length, '`data.fields` must be non-empty');
  return (
    baseCols &&
    baseCols.length &&
    baseCols.every(col => 0 <= col && col < fields.length)
  );
};

//---------NClusters----------//

export const defaultNClusters = state => {
  const {
    data: {columns},
  } = state;
  assert(
    columns.length && columns[0].length,
    '`data.columns` must be non-empty'
  );
  return Math.min(4, columns[0].length);
};

export const isValidNClusters = state => {
  const {
    nClusters,
    data: {columns},
  } = state;
  assert(
    columns.length && columns[0].length,
    '`data.columns` must be non-empty'
  );
  return (
    !isNaN(nClusters) && nClusters !== null && nClusters <= columns[0].length
  );
};

//---------SegmentFilters----------//

/**
 * @return {Array<Array<Object>} length corresponds to number of segments, each element is an array of filters each segment must fulfill
 */
export const defaultSegmentFilters = state => {
  const {
    data: {fields},
    baseCols,
  } = state;
  assert(
    fields.length && baseCols.length,
    '`data.field` and `baseCols` must be non-empty'
  );
  const baseColFields = baseCols.map(colId => fields[colId]);
  const filtersByField = baseColFields.map(field =>
    defaultSegmentFiltersFromFieldDef(field)
  );
  // todo: this is not the most efficient way to do filtering (should organize filters by fields). Keeping the structure to for backward compatibility
  return product(filtersByField);
};

export const isValidSegmentFilters = state => {
  const {
    data: {fields},
    baseCols,
    segmentFilters,
  } = state;
  assert(
    fields.length && baseCols.length,
    '`data.field` and `baseCols` must be non-empty'
  );
  return (
    segmentFilters.length &&
    segmentFilters.every(segmentFilter => {
      return (
        segmentFilter.length &&
        // each baseCol must have a corresponding filter
        segmentFilter.length === baseCols.length &&
        segmentFilter.every((filter, i) => {
          const colId = filter.key;
          // each baseCol and their corresponding filter must be in the same order
          if (baseCols[i] !== colId) return false;
          assert(
            fields[colId],
            'columns corresponfing to `filter.key` must exist in data'
          );
          // filter type and values must conform with field definition
          return isValidSegmentFilterFromFieldDef(filter, fields[colId]);
        })
      );
    })
  );
};

/**
 * compute segmentFilter from a single field definition
 * @param {Object} field - contains {name, type, tableFieldIndex, role, dataType, domain}
 * @returns {Array<Object>} segmentFilters, each contains {name, key, type, value}
 */
export const defaultSegmentFiltersFromFieldDef = field => {
  const {name, tableFieldIndex} = field;
  const type = defaultFilterTypeFromFieldDef(field);
  const filterVals = defaultFilterValueFromFieldDef(field);
  return filterVals.map(filterVal => ({
    name,
    key: tableFieldIndex - 1,
    type,
    value: filterVal,
  }));
};

/**
 * @param {Object} field - contains {name, type, tableFieldIndex, role, dataType, domain}
 * @returns {String} filterType - one of FILTER_TYPE
 */
const defaultFilterTypeFromFieldDef = field => {
  const {type} = field;
  switch (type) {
    case FEATURE_TYPE.NUMERICAL:
      return FILTER_TYPE.RANGE;
    case FEATURE_TYPE.CATEGORICAL:
      return FILTER_TYPE.INCLUDE;
    default:
      return FEATURE_TYPE.FUNC;
  }
};

/**
 * @param {Object} field - contains {name, type, tableFieldIndex, role, dataType, domain}
 * @returns {Array<Object>} segmentFilters, each contains {name, key, type, value}
 */
const defaultFilterValueFromFieldDef = field => {
  const {role, type, domain} = field;
  assert(
    Array.isArray(domain) && domain.length > 1,
    'domain length must be larger than 1'
  );
  let midPoint;
  switch (type) {
    case FEATURE_TYPE.NUMERICAL:
      // for selecting over/under prediction
      // todo: score columns don't have domain field right now. To add.
      if (
        role === FIELD_ROLE.SCORE &&
        domain[0] < 0 &&
        domain[domain.length - 1] > 0
      ) {
        midPoint = 0;
      } else {
        midPoint = (domain[0] + domain[domain.length - 1]) / 2;
      }
      return [[domain[0], midPoint], [midPoint, domain[domain.length - 1]]];

    case FEATURE_TYPE.CATEGORICAL:
      return [[domain[0]], [domain[1]]];

    default:
      return [[], []];
  }
};

//todo: consolidate with `isValidFilterVals` in modules/manifold/src/components/ui/segment-panels/utils.js
/**
 * given a filter and the corresponding field definition, determine whether the filter is valid
 * @param  {Object} filter - contains {name, key, type, value}
 * @param  {object} field - contains {name, tableFieldIndex, type, dataType, role, domain}
 * @return {boolean}
 */
export const isValidSegmentFilterFromFieldDef = (filter, field) => {
  const {type: filterType, value} = filter;
  const {type: featureType, domain} = field;

  if (featureType === FEATURE_TYPE.CATEGORICAL) {
    assert(domain && domain.length, '`field.domain` must be an array');
    return (
      filterType === FILTER_TYPE.INCLUDE &&
      // filter must contain a subset of column domain
      value.length < domain.length &&
      value.every(val => domain.includes(val))
    );
  } else if (featureType === FEATURE_TYPE.NUMERICAL) {
    assert(domain && domain.length, '`field.domain` must be an array');
    return (
      filterType === FILTER_TYPE.RANGE &&
      value &&
      value.length === 2 &&
      value[0] < value[1] &&
      // filter must contain a subset of column domain
      (domain[0] > value[0] || domain[domain.length - 1] < value[1]) &&
      // filter must be non-empty
      (domain[0] <= value[1] && domain[domain.length - 1] >= value[0])
    );
  } else {
    return filterType === FILTER_TYPE.FUNC && typeof value === 'function';
  }
};

//---------SegmentGroups----------//

export const defaultSegmentGroups = state => {
  // todo: consolidate with `getSegmentIds` in modules/manifold/src/selectors/adaptors.js
  const {isManualSegmentation, nClusters, segmentFilters} = state;
  const nSegments = isManualSegmentation ? segmentFilters.length : nClusters;
  const nTreatment = nSegments < 4 ? 1 : 2;
  const rangeArr = Array.from(Array(nSegments).keys());
  return [
    rangeArr.slice(nSegments - nTreatment),
    rangeArr.slice(0, nSegments - nTreatment),
  ];
};

export const isValidSegmentGroups = state => {
  const {
    segmentGroups,
    isManualSegmentation,
    nClusters,
    segmentFilters,
  } = state;
  const nSegments = isManualSegmentation ? segmentFilters.length : nClusters;
  for (let i = 0; i < segmentGroups.length; i++) {
    // no groups should be empty
    if (!segmentGroups[i].length) {
      return false;
    }
    // group0 is "otherGroup" for group1; vice versa
    const otherGroup = segmentGroups[(i + 1) % 2];
    for (let j = 0; j < segmentGroups[i].length; j++) {
      const segmentId = segmentGroups[i][j];
      // no segment index should be out of range; no overlapping between 2 segment groups
      if (
        segmentId < 0 ||
        segmentId >= nSegments ||
        otherGroup.includes(segmentId)
      ) {
        return false;
      }
    }
  }
  return true;
};

export const setDefaultFuncs = {
  metric: defaultMetric,
  baseCols: defaultBaseCols,
  nClusters: defaultNClusters,
  segmentFilters: defaultSegmentFilters,
  segmentGroups: defaultSegmentGroups,
};

export const isValidFuncs = {
  metric: isValidMetric,
  baseCols: isValidBaseCols,
  nClusters: isValidNClusters,
  segmentFilters: isValidSegmentFilters,
  segmentGroups: isValidSegmentGroups,
};
