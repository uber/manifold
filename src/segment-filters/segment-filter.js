// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {Select, Slider} from 'antd';
import SegmentFilterDistribution from './segment-filter-distribution';
import {FEATURE_TYPE} from './constants';

const SegmentFilterContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const SegmentFilterKey = styled.div`
  color: #666;
  font-size: 12px;
  overflow-wrap: break-word;
`;

const round = (n, decimal = 2) => {
  const scale = Math.pow(10, decimal);
  return Math.round(n * scale) / scale;
};

export default class SegmentFilter extends PureComponent {
  static propTypes = {
    attribute: PropTypes.shape({
      key: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.any),
      domain: PropTypes.arrayOf(PropTypes.any),
    }).isRequired,
    filter: PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.arrayOf(PropTypes.any),
      type: PropTypes.string.isRequired,
    }).isRequired,
    updateFilter: PropTypes.func,
  };

  static defaultProps = {
    attribute: null,
    filter: null,
    updateFilter: () => {},
  };

  state = {
    selectedDomain: [],
  };

  _handleUpdateFilterValue = value => {
    const {filter, updateFilter} = this.props;
    this.setState({selectedDomain: value}, updateFilter({...filter, value}));
  };

  _renderFilterControl = () => {
    const {attribute, filter} = this.props;
    if (!attribute || !attribute.domain || !attribute.domain.length) {
      return null;
    }
    const min = round(attribute.domain[0]);
    const max = round(attribute.domain[attribute.domain.length - 1]);

    switch (attribute.type) {
      case FEATURE_TYPE.NUMERICAL:
        return (
          <Slider
            key={filter.key}
            range
            min={min}
            max={max}
            defaultValue={[min, max]}
            style={{margin: '0px 4px 4px 4px'}}
            onChange={this._handleUpdateFilterValue}
          />
        );
      case FEATURE_TYPE.CATEGORICAL:
        return (
          <Select
            key={filter.key}
            mode="multiple"
            size="small"
            style={{width: '100%'}}
            placeholder="Please select"
            onChange={this._handleUpdateFilterValue}
          >
            {attribute.domain.map(d => (
              <Select.Option key={d}>{d}</Select.Option>
            ))}
          </Select>
        );
      default:
        return <div>{`Feature type ${attribute.type} not supported.`}</div>;
    }
  };

  render() {
    const {attribute, filter} = this.props;
    if (!attribute || !filter) {
      return null;
    }

    return (
      <SegmentFilterContainer>
        <SegmentFilterKey>{filter.key}</SegmentFilterKey>
        <SegmentFilterDistribution
          attribute={attribute}
          domainAlt={this.state.selectedDomain}
        />
        {this._renderFilterControl()}
      </SegmentFilterContainer>
    );
  }
}
