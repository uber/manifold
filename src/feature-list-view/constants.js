import PropTypes from 'prop-types';
import {FEATURE_TYPE, COLOR} from 'packages/mlvis-common/constants';

// height of each feature view chart
export const ITEM_HEIGHT = 72;
// for tooltips in feature views
// width in number of pixels for one character
export const CHAR_WIDTH = 7;
// number of characters separating each text
export const CHAR_SEPARATION = 2;

export const HEADER_HEIGHT = 16;
export const FOOTER_HEIGHT = 18;

export const RIGHT_MARGIN_WIDTH = 36;

export const CHART_PROP_TYPES = {
  id: PropTypes.string.isRequired,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.shape({
    distributions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    distributionsValueRange: PropTypes.arrayOf(PropTypes.number),
    distributionsNormalized: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.number)
    ),
    divergence: PropTypes.number,
    domain: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
    ),
    categoriesSortedOrder: PropTypes.arrayOf(PropTypes.number),
    name: PropTypes.string,
    type: PropTypes.oneOf(Object.values(FEATURE_TYPE)),
    values: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.bool,
        ])
      )
    ),
  }),
  colors: PropTypes.arrayOf(PropTypes.string),
  xScale: PropTypes.func,
};

export const CHART_DEFAULT_PROPS = {
  id: 'default-numerical-feature-id',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  data: null,
  colors: [COLOR.GREEN, COLOR.PURPLE],
  xScale: () => 0,
};
