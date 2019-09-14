import assert from 'assert';
import {
  FEATURE_TYPE,
  FILTER_TYPE,
  FIELD_ROLE,
} from '@mlvis/mlvis-common/constants';
import {dotRange} from '@mlvis/mlvis-common/utils';
import {product} from './utils';
// arguments of functions in this file need to be fields in state

/**
 * compute default segmentation filters based on columns to filter by
 * @param {Object} data - contains {columns, fields}
 * @param {Array<Number>} baseCols - array of column indexes
 * @return {Array<Array<Object>} length corresponds to number of segments, each element is an array of filters each segment must fulfill
 */
export const defaultSegmentFiltersFromBaseCols = (data, baseCols) => {
  const {fields} = data;
  const baseColFields = baseCols.map(colId => fields[colId]);
  const filtersByField = baseColFields.map(field =>
    defaultSegmentFiltersFromFieldDef(field)
  );
  // todo: this is not the most efficient way to do filtering (should organize filters by fields). Keeping the structure to for backward compatibility
  return product(filtersByField);
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

export const defaultBaseCols = columnTypeRanges => {
  return dotRange(...columnTypeRanges.score);
};
