import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import clone from 'lodash.clone';
import {generateRandomId} from '@mlvis/mlvis-common/utils';
import Plus from 'baseui/icon/plus';

import {THEME_COLOR, STATE_DATA_TYPES, FIELD} from '../../../constants';
import {dotSet} from '../../../utils';
import SegmentPanelList from './segment-panel-list';

const Container = styled.div`
  position: relative;
`;

const Header = styled.div`
  position: absolute;
  right: 0;
  top: -28px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
`;

const ConfirmButton = styled.div`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  color: ${props => (props.disabled ? '#aaa' : THEME_COLOR)};
`;

const IconButton = styled.div`
  height: 24px;
  padding-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 1px;
  transition: 0.2s;
`;

const _getSegmentFiltersStateFromProps = segmentFilters =>
  segmentFilters.map((filters, segmentId) => ({
    // key is only use as keys to segment panels
    key: generateRandomId(),
    filters,
  }));

const _getSegmentFiltersPropsFromState = segmentFilters =>
  segmentFilters.map(filters => filters.filters);

export default class SegmentFiltersControl extends PureComponent {
  static propTypes = {
    columnDefs: PropTypes.arrayOf(FIELD),
    segmentFilters: STATE_DATA_TYPES.segmentFilters,
    onUpdateSegmentFilters: PropTypes.func,
  };

  static defaultProps = {
    columnDefs: [],
    segmentFilters: [[], []],
    onUpdateSegmentFilters: () => {},
  };

  // SegmentFiltersControl is reset to default state, controlled by a key, whenever baseCols change
  state = {
    segmentFilters: _getSegmentFiltersStateFromProps(this.props.segmentFilters),
    hasChanged: false,
  };

  _onUpdateSegmentFilters = () => {
    this.setState({hasChanged: false}, () =>
      this.props.onUpdateSegmentFilters(
        _getSegmentFiltersPropsFromState(this.state.segmentFilters)
      )
    );
  };

  _onUpdateFilterValue = (segmentId, filterId, filterValue) => {
    const {segmentFilters} = this.state;
    const updatedSegmentFilters = dotSet(
      segmentFilters,
      [segmentId, 'filters', filterId, 'value'],
      filterValue
    );
    this.setState({
      segmentFilters: updatedSegmentFilters,
      hasChanged: true,
    });
  };

  _onAppendSegment = () => {
    const {segmentFilters} = this.state;
    // just duplicate the last segment
    const newSegment = segmentFilters[segmentFilters.length - 1].filters.map(
      filter => ({
        ...filter,
        value: clone(filter.value),
      })
    );
    this.setState({
      segmentFilters: segmentFilters.concat({
        key: generateRandomId(),
        filters: newSegment,
      }),
      hasChanged: true,
    });
  };

  _onRemoveSegment = segmentId => {
    const {segmentFilters} = this.state;
    // todo: possibily add error message when length <= 2
    if (segmentFilters.length > 2) {
      this.setState({
        segmentFilters: segmentFilters.filter((_, id) => id !== segmentId),
        hasChanged: true,
      });
    }
  };

  render() {
    const {columnDefs} = this.props;
    const {hasChanged, segmentFilters} = this.state;

    return (
      <Container>
        <SegmentPanelList
          segmentFilters={segmentFilters}
          columnDefs={columnDefs}
          onRemoveSegment={this._onRemoveSegment}
          onUpdateFilterValue={this._onUpdateFilterValue}
        />
        <Header>
          <ConfirmButton
            disabled={!hasChanged}
            onClick={this._onUpdateSegmentFilters}
          >
            {hasChanged ? 'Confirm' : 'Confirmed!'}
          </ConfirmButton>
        </Header>
        <Footer>
          <IconButton onClick={this._onAppendSegment}>
            <Plus size={18} />
            {'Add segment'}
          </IconButton>
          <ConfirmButton
            disabled={!hasChanged}
            onClick={this._onUpdateSegmentFilters}
          >
            {hasChanged ? 'Confirm' : 'Confirmed!'}
          </ConfirmButton>
        </Footer>
      </Container>
    );
  }
}
