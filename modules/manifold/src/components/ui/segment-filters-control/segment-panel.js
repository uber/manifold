import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Delete from 'baseui/icon/delete';
import ChevronRight from 'baseui/icon/chevron-right';
import ChevronDown from 'baseui/icon/chevron-down';
import {FILTER, FIELD, THEME} from '../../../constants';
import SegmentFilter from './segment-filter';
import {FEATURE_TYPE, FILTER_TYPE} from '@mlvis/mlvis-common/constants';

const FEATURE_TYPE_TO_FILTER_TYPE_MAP = {
  [FEATURE_TYPE.BOOLEAN]: FILTER_TYPE.INCLUDE,
  [FEATURE_TYPE.CATEGORICAL]: FILTER_TYPE.INCLUDE,
  [FEATURE_TYPE.NUMERICAL]: FILTER_TYPE.RANGE,
};

const Container = styled.div`
  background: #fff;
  box-shadow: ${props =>
    props.isOpen ? 'rgba(0, 0, 0, 0.1) 0 0 4px' : 'none'};
  margin-bottom: 4px;
`;

const Header = styled.div`
  border-bottom: ${props => (props.isOpen ? '1px solid #f0f0f0' : 'none')};
  background-color: ${props =>
    props.isOpen ? '#fff' : THEME.colors.inputFill};
  font-size: 13px;
  font-weight: normal;
  color: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
  padding: 4px 4px 4px 8px;
`;

const HeaderTextGroup = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-right: 8px;
`;

const IconButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  color: ${props => (props.disabled ? '#ccc' : '#000')}
  margin: 1px;
  transition: 0.2s;
`;

export default class SegmentPanel extends PureComponent {
  static propTypes = {
    segmentId: PropTypes.number.isRequired,
    nSegments: PropTypes.number.isRequired,
    filters: PropTypes.arrayOf(FILTER),
    columnDefs: PropTypes.arrayOf(FIELD),
    onRemoveSegment: PropTypes.func,
    onUpdateFilterValue: PropTypes.func,
  };

  static defaultProps = {
    filters: [],
    columnDefs: [],
    onRemoveSegment: () => {},
    onUpdateFilterValue: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {isOpen: props.segmentId === 0};
  }

  _onToggleOpen = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  _onRemoveSegment = segmentId => {
    if (this.props.nSegments > 2) {
      this.props.removeSegment(segmentId);
    }
  };

  _handleAddRemoveFilters = newKeys => {
    const {
      attributes,
      segment: {filters = []},
    } = this.props;

    const oldKeys = filters.map(f => f.key);
    const keysToAppend = newKeys.filter(key => !oldKeys.includes(key));
    const keysToRemove = oldKeys.filter(key => !newKeys.includes(key));

    const filtersToAppend = keysToAppend.map(key => {
      const {type: attributeType} = attributes.find(attr => attr.key === key);
      return {
        key,
        keyIndex: 0,
        type: FEATURE_TYPE_TO_FILTER_TYPE_MAP[attributeType],
      };
    });

    const updatedFilters = filters
      .filter(f => !keysToRemove.includes(f.key))
      .concat(filtersToAppend)
      .sort((a, b) => a.key.localeCompare(b.key));

    this.props.updateFilters(updatedFilters);
  };

  render() {
    const {
      nSegments,
      segmentId,
      filters,
      columnDefs,
      onRemoveSegment,
      onUpdateFilterValue,
    } = this.props;
    const {isOpen} = this.state;

    return (
      <Container isOpen={isOpen}>
        <Header isOpen={isOpen}>
          <HeaderTextGroup onClick={this._onToggleOpen}>
            <IconButton>
              {isOpen ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
            </IconButton>
            {`segment ${segmentId}`}
          </HeaderTextGroup>
          <IconButton
            disabled={nSegments < 2}
            onClick={() => onRemoveSegment(segmentId)}
          >
            <Delete size={18} />
          </IconButton>
        </Header>
        {isOpen && (
          <div>
            {filters.map((filter, i) => (
              <SegmentFilter
                key={filter.key}
                segmentId={segmentId}
                filterId={i}
                filter={filter}
                columnDef={columnDefs[filter.key]}
                onUpdateFilterValue={onUpdateFilterValue}
              />
            ))}
          </div>
        )}
      </Container>
    );
  }
}
