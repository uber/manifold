import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';

import {STATE_DATA_TYPES, FIELD} from '../../../constants';
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

// UTILITIES
// generate mono-increasing Id, unique for single client
const randomId = () =>
  Date.now()
    .toString(36)
    .substr(2, 7);

export default class SegmentPanelList extends PureComponent {
  static propTypes = {
    baseCols: STATE_DATA_TYPES.baseCols,
    columnDefs: PropTypes.arrayOf(FIELD),
    segmentFilters: STATE_DATA_TYPES.segmentFilters,
    onUpdateSegmentFilters: PropTypes.func,
  };

  static defaultProps = {
    baseCols: [],
    columnDefs: [],
    segmentFilters: [[], []],
    onUpdateSegmentFilters: () => {},
  };

  state = {
    // create one segment with a random Id as default
    segments: [{key: randomId()}],
    segmentsUpdated: false,
  };

  _handleUpdateFilters = (key, filters) => {
    const updatedSegments = this.state.segments
      .filter(segment => segment.key !== key)
      .concat({key, filters})
      .sort((a, b) => a.key.localeCompare(b.key));

    this.setState({segments: updatedSegments, segmentsUpdated: true});
  };

  _handleUpdateSegments = () => {
    this.props.updateSegmentFilters(this.state.segments);
    this.setState({segmentsUpdated: false});
  };

  _handleAppendSegment = () => {
    const {segments} = this.state;
    this.setState({segments: segments.concat({key: randomId()})});
  };

  _handleRemoveSegment = key => {
    console.log('removing segment', key);
    // const {segments} = this.state;
    // this.setState({
    //   segments: segments.filter(segment => segment.key !== key),
    // });
  };

  _renderSegmentPanels = () => {
    const {attributes} = this.props;
    const {segments} = this.state;
    if (!segments || !segments.length) {
      return null;
    }

    return segments.map(segment => (
      <SegmentPanel
        key={segment.key}
        attributes={attributes}
        segment={segment}
        removeSegment={this._handleRemoveSegment}
        updateFilters={filters =>
          this._handleUpdateFilters(segment.key, filters)
        }
      />
    ));
  };

  render() {
    const {segmentFilters, columnDefs} = this.props;

    return (
      <SegmentPanelListContainer>
        {segmentFilters.map((singleSegmentFilters, i) => (
          <SegmentPanel
            key={i}
            segmentId={i}
            filters={singleSegmentFilters}
            columnDefs={columnDefs}
            removeSegment={this._handleRemoveSegment}
            // updateFilters={filters =>
            //   this._handleUpdateFilters(segment.key, filters)
            // }
          />
        ))}
      </SegmentPanelListContainer>
    );
  }
}
