import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';

import {FILTER, FIELD} from '../../../constants';
import SegmentPanel from './segment-panel';

const SegmentPanelListContainer = styled.div`
  color: #666;
  font-family: ff-clan-web-pro, 'Helvetica Neue', Helvetica, sans-serif;
  font-size: 12px;

  ${props =>
    props.withPadding &&
    css`
      background: #fff;
      padding: 12px;
    `};
`;

export default class SegmentPanelList extends PureComponent {
  static propTypes = {
    columnDefs: PropTypes.arrayOf(FIELD),
    segmentFilters: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        filters: PropTypes.arrayOf(FILTER),
      })
    ),
    onUpdateFilterValue: PropTypes.func,
    onRemoveSegment: PropTypes.func,
  };

  static defaultProps = {
    baseCols: [],
    columnDefs: [],
    segmentFilters: [{key: '0', filters: []}, {key: '1', filters: []}],
    onUpdateFilterValue: () => {},
  };

  render() {
    const {
      segmentFilters,
      columnDefs,
      onRemoveSegment,
      onUpdateFilterValue,
    } = this.props;

    return (
      <SegmentPanelListContainer>
        {segmentFilters.map((singleSegmentFilters, i) => (
          <SegmentPanel
            key={singleSegmentFilters.key}
            segmentId={i}
            nSegments={segmentFilters.length}
            filters={singleSegmentFilters.filters}
            columnDefs={columnDefs}
            onRemoveSegment={onRemoveSegment}
            onUpdateFilterValue={onUpdateFilterValue}
          />
        ))}
      </SegmentPanelListContainer>
    );
  }
}
