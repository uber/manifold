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
        _key: PropTypes.string,
        _content: PropTypes.arrayOf(FILTER),
      })
    ),
    onUpdateFilterValue: PropTypes.func,
  };

  static defaultProps = {
    baseCols: [],
    columnDefs: [],
    segmentFilters: [[], []],
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
            key={singleSegmentFilters._key}
            segmentId={i}
            nSegments={segmentFilters.length}
            filters={singleSegmentFilters._content}
            columnDefs={columnDefs}
            onRemoveSegment={onRemoveSegment}
            onUpdateFilterValue={onUpdateFilterValue}
          />
        ))}
      </SegmentPanelListContainer>
    );
  }
}
