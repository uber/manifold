// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import SegmentFilter from './segment-filter';

const SegmentFilterListContainer = styled.div`
  background-color: #f8f8f8;
  padding: 12px;
`;

export default class SegmentFilterList extends PureComponent {
  static propTypes = {
    attributes: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(PropTypes.any),
        domain: PropTypes.arrayOf(PropTypes.any),
      })
    ).isRequired,
    filters: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        value: PropTypes.arrayOf(PropTypes.any),
        type: PropTypes.string,
      })
    ).isRequired,
    updateFilters: PropTypes.func,
  };

  static defaultProps = {
    attributes: null,
    filters: null,
    updateFilters: () => {},
  };

  _handleUpdateFilter = filter => {
    const updatedFilters = this.props.filters
      // replace filter with the new one
      .filter(f => f.key !== filter.key)
      .concat(filter)
      .sort((a, b) => a.key.localeCompare(b.key));

    this.props.updateFilters(updatedFilters);
  };

  render() {
    const {attributes, filters} = this.props;
    if (!filters || !filters.length) {
      return null;
    }

    const filterControls = filters.map(filter => {
      const attribute = attributes.find(d => d.key === filter.key);
      return (
        <SegmentFilter
          key={filter.key}
          attribute={attribute}
          filter={filter}
          updateFilter={this._handleUpdateFilter}
        />
      );
    });

    return (
      <SegmentFilterListContainer>{filterControls}</SegmentFilterListContainer>
    );
  }
}
