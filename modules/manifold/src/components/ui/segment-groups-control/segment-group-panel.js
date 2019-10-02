import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import SegmentButtonGroup from './segment-button-group';
import {SegmentPanel} from '../styled-components';
import {updateSegmentGroups} from './utils';

export default class SegmentGroupPanel extends PureComponent {
  static propTypes = {
    /** candidate segments shared across all segment groups: e.g., [0, 1, 2, 3] */
    candidates: PropTypes.arrayOf(PropTypes.number),
    /** selected segments for each segment group: e.g., [[1], [2, 3]] */
    selected: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    /** callback function to surface the updated segment grouping */
    onUpdateSegmentGroups: PropTypes.func,
    /** colors indicatin each group */
    colors: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    candidates: [],
    selected: [[], []],
    onUpdateSegmentGroups: () => {},
    colors: ['#f00', '#000'],
  };

  _updateSelectedSegmentGroups = ({groupId, segmentId}) => {
    const newSelected = updateSegmentGroups(
      this.props.selected,
      groupId,
      segmentId
    );
    this.props.onUpdateSegmentGroups(newSelected);
  };

  render() {
    const {colors, candidates, selected} = this.props;

    return (
      <SegmentPanel>
        {[0, 1].map(groupId => (
          <SegmentButtonGroup
            id={groupId}
            key={groupId}
            color={colors[groupId]}
            candidates={candidates}
            selected={selected[groupId]}
            onSelect={this._updateSelectedSegmentGroups}
          />
        ))}
      </SegmentPanel>
    );
  }
}
