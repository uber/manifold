import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {FILTER_TYPE, FEATURE_TYPE} from '@mlvis/mlvis-common/constants';

import SegmentButtonGroup from '../segment-group-panel/segment-button-group';
import {SegmentPanel, StyledSelect, SelectArrow} from '../styled-components';
import {
  isValidFilterVals,
  getFilterValsFromProps,
  getSegmentFiltersFromValues,
} from '../segment-group-panel/utils';

// todo: add timestamp feature type
// const DATE_STRING_REGEX = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
const SEGMENT_COLORS = ['#D64A62', '#528AD0'];

const DEFAULT_SEGMENTATION_FEATURE = {
  name: 'default_feature',
  type: FEATURE_TYPE.NUMERICAL,
  domain: [],
};
const DEFAULT_SEGMENT_FILTERS = [[{}], [{}]];

// TODO TEMP will switch to 3rd-party component for date range selectiokn
const ValueRange = styled.div`
  width: calc(100% - 16px);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  input {
    width: 48%;
    height: 28px;
    background: #fafafa;
    border: 0;
    color: #000;
    font-size: 13px;
    text-align: center;
  }
`;

const ValueSelect = styled(StyledSelect)`
  width: calc(100% - 16px);
  height: 28px;
  background: #fafafa;
  select {
    font-size: 13px;
  }
`;

export default class SegmentFilterPanel extends PureComponent {
  // todo: when a different feature is chosen ie segmentationFeatureMeta changes,
  // state.filterVals should reset
  state = {
    currentFilterKey: this.props.segmentationFeatureMeta.name,
    filterVals: getFilterValsFromProps(
      this.props.segmentFilters,
      this.props.segmentationFeatureMeta
    ),
  };

  static propTypes = {
    /** meta data of the feature to filter on, each of shape name, type, and domain */
    segmentationFeatureMeta: PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(Object.values(FEATURE_TYPE)),
      tableFieldIndex: PropTypes.number,
      domain: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.bool,
        ])
      ),
    }),
    /** input segment filters, each of shape key, value, and type */
    segmentFilters: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.number,
          value: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
            PropTypes.func,
            PropTypes.arrayOf(PropTypes.number),
            PropTypes.arrayOf(PropTypes.string),
            PropTypes.arrayOf(PropTypes.bool),
          ]),
          type: PropTypes.oneOf(Object.values(FILTER_TYPE)),
        })
      )
    ),
    /** callback function to surface the updated segment grouping */
    onUpdateSegmentFilters: PropTypes.func,
  };

  static defaultProps = {
    segmentationFeatureMeta: DEFAULT_SEGMENTATION_FEATURE,
    segmentFilters: DEFAULT_SEGMENT_FILTERS,
    onUpdateSegmentFilters: () => {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // prioritize the newly selected feature `nextProps.segmentationFeatureMeta.name`
    // over the outdated segment filter keys `prevState.currentFilterKey`
    if (nextProps.segmentationFeatureMeta.name !== prevState.currentFilterKey) {
      return {
        ...prevState,
        currentFilterKey: nextProps.segmentationFeatureMeta.name,
        filterVals: getFilterValsFromProps(
          DEFAULT_SEGMENT_FILTERS,
          nextProps.segmentationFeatureMeta
        ),
      };
    }
    return prevState;
  }

  // filter values
  _updateFilterValue = e => {
    const {
      segmentationFeatureMeta: {type},
    } = this.props;
    const {filterVals} = this.state;

    // id: 0::from, value: 2019-05-10
    const {id, value} = e.target;
    const [targetId, fromTo] = id.split('::');
    const segmentId = Number(targetId);

    // modify filter values of the intended segment
    let filterVal;
    if (type === FEATURE_TYPE.NUMERICAL) {
      filterVal = filterVals[segmentId].slice();
      if (fromTo === 'from') {
        filterVal[0] = Number(value);
      } else if (fromTo === 'to') {
        filterVal[1] = Number(value);
      }
    } else if (type === FEATURE_TYPE.CATEGORICAL) {
      // take care of true / false category
      const category =
        value === 'true' ? true : value === 'false' ? false : value;
      filterVal = [];
      filterVal.push(category);
    }

    const updatedFilterVals = filterVals.slice();
    updatedFilterVals[segmentId] = filterVal;

    this.setState(
      {filterVals: updatedFilterVals},
      this._onConfirmSegmentFilters
    );
  };

  _onConfirmSegmentFilters = () => {
    const {segmentationFeatureMeta} = this.props;
    const {filterVals} = this.state;

    if (isValidFilterVals(filterVals, segmentationFeatureMeta)) {
      const segmentFilters = getSegmentFiltersFromValues(
        filterVals,
        segmentationFeatureMeta
      );
      this.props.onUpdateSegmentFilters(segmentFilters);
    } else {
      // todo: surface error to UI
    }
  };

  _renderFilterValue = ({segmentId, filterVal}) => {
    const {
      segmentationFeatureMeta: {type, domain},
    } = this.props;
    if (type === FEATURE_TYPE.NUMERICAL) {
      return (
        <ValueRange>
          <input
            id={`${segmentId}::from`}
            type="number"
            placeholder="feature value"
            value={filterVal[0]}
            onChange={this._updateFilterValue}
          />
          -
          <input
            id={`${segmentId}::to`}
            type="number"
            placeholder="feature value"
            value={filterVal[1]}
            onChange={this._updateFilterValue}
          />
        </ValueRange>
      );
    }
    if (type === FEATURE_TYPE.CATEGORICAL) {
      // use String() to take care of true/false category
      return (
        <ValueSelect>
          <select
            id={segmentId}
            value={filterVal[0] === undefined ? '' : String(filterVal[0])}
            onChange={this._updateFilterValue}
          >
            <option value="" disabled hidden>
              feature value
            </option>
            {domain.map((category, i) => (
              <option value={String(category)} key={i}>
                {String(category)}
              </option>
            ))}
          </select>
          <SelectArrow height="16" />
        </ValueSelect>
      );
    }
  };

  render() {
    const {filterVals} = this.state;
    return (
      <SegmentPanel>
        {[0, 1].map(id => (
          <SegmentButtonGroup key={id} id={id} color={SEGMENT_COLORS[id]}>
            {this._renderFilterValue({
              segmentId: id,
              filterVal: filterVals[id],
            })}
          </SegmentButtonGroup>
        ))}
      </SegmentPanel>
    );
  }
}
