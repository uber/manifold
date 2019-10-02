import PropTypes from 'prop-types';
import {FILTER_TYPE, FEATURE_TYPE} from '@mlvis/mlvis-common/constants';

export const FIELD = PropTypes.shape({
  name: PropTypes.string,
  tableFieldIndex: PropTypes.number,
  type: PropTypes.oneOf(Object.values(FEATURE_TYPE)),
  domain: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
});

export const FILTER = PropTypes.shape({
  name: PropTypes.string.isRequired,
  key: PropTypes.number.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.func,
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.bool),
  ]).isRequired,
  type: PropTypes.oneOf(Object.values(FILTER_TYPE)),
});

export const STATE_DATA_TYPES = {
  modelsMeta: PropTypes.shape({
    nClasses: PropTypes.number,
    classLabels: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
  }),
  metric: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    func: PropTypes.func.isRequired,
  }),
  isManualSegmentation: PropTypes.bool,
  baseCols: PropTypes.arrayOf(PropTypes.number),
  nClusters: PropTypes.number,
  /** input segment filters, each of shape key, value, and type */
  segmentFilters: PropTypes.arrayOf(PropTypes.arrayOf(FILTER)),
  segmentGroups: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
};
