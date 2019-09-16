// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {Button, Input, Select, Tag} from 'baseui';
import SegmentFilterList from './segment-filter-list';
import {FEATURE_TYPE, FILTER_TYPE} from '@mlvis/mlvis-common/constants';

const FEATURE_TYPE_TO_FILTER_TYPE_MAP = {
  [FEATURE_TYPE.BOOLEAN]: FILTER_TYPE.INCLUDE,
  [FEATURE_TYPE.CATEGORICAL]: FILTER_TYPE.INCLUDE,
  [FEATURE_TYPE.NUMERICAL]: FILTER_TYPE.RANGE,
};

const SegmentPanelContainer = styled.div`
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
`;

const SegmentPanelHeader = styled.div`
  border-bottom: 1px solid #e8e8e8;
  height: 48px;
  padding: 12px 16px;
`;

const AttributeTag = ({type}) => {
  switch (type) {
    case FEATURE_TYPE.NUMERICAL:
      return <Tag color="blue">{FEATURE_TYPE.NUMERICAL}</Tag>;
    case FEATURE_TYPE.CATEGORICAL:
      return <Tag color="volcano">{FEATURE_TYPE.CATEGORICAL}</Tag>;
    case FEATURE_TYPE.BOOLEAN:
      return <Tag color="purple">{FEATURE_TYPE.BOOLEAN}</Tag>;
    default:
      return <Tag>unkown</Tag>;
  }
};

export default class SegmentPanel extends PureComponent {
  static propTypes = {
    attributes: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
      })
    ).isRequired,
    segment: PropTypes.object.isRequired,
    removeSegment: PropTypes.func,
    updateFilters: PropTypes.func,
  };

  static defaultProps = {
    attributes: [],
    segment: null,
    removeSegment: () => {},
    updateFilters: () => {},
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

  // the header contains a dropdown list of candidate fields to be filtered
  _renderSegmentPanelHeader = () => {
    const {attributes, segment, removeSegment} = this.props;

    const options = attributes.map(attr => {
      return (
        <Select.Option key={attr.key}>
          <span>
            <AttributeTag type={attr.type} />
            {attr.key}
          </span>
        </Select.Option>
      );
    });

    return (
      <SegmentPanelHeader>
        <Input.Group compact>
          <Select
            autoFocus
            maxTagCount={0}
            mode="multiple"
            size="small"
            dropdownMatchSelectWidth={false}
            style={{width: '82%'}}
            placeholder="Select attributes"
            onChange={this._handleAddRemoveFilters}
          >
            {options}
          </Select>
          <Button
            size="small"
            icon="delete"
            onClick={() => removeSegment(segment.key)}
          />
        </Input.Group>
      </SegmentPanelHeader>
    );
  };

  _renderSegmentPanelContent = () => {
    const {
      attributes = [],
      segment: {filters = []},
      updateFilters,
    } = this.props;

    return (
      <SegmentFilterList
        attributes={attributes}
        filters={filters}
        updateFilters={updateFilters}
      />
    );
  };

  render() {
    const {segment} = this.props;
    if (!segment) {
      return null;
    }

    return (
      <SegmentPanelContainer>
        {this._renderSegmentPanelHeader(segment)}
        {this._renderSegmentPanelContent()}
      </SegmentPanelContainer>
    );
  }
}
