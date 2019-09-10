import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import SegmentButtonGroup from './segment-button-group';
import {SegmentPanel} from '../styled-components';
import {updateSegmentGroups} from '../../utils';
import {COLORS} from '../../constants';

export default class SegmentGroupPanel extends PureComponent {
  state = {
    candidates: this.props.candidates,
    selected: this.props.selected,
  };

  static propTypes = {
    /** candidate segments shared across all segment groups: e.g., [0, 1, 2, 3] */
    candidates: PropTypes.arrayOf(PropTypes.number),
    /** selected segments for each segment group: e.g., [[1], [2, 3]] */
    selected: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    /** callback function to surface the updated segment grouping */
    onUpdateSegmentGroups: PropTypes.func,
  };

  static defaultProps = {
    candidates: [],
    selected: [[], []],
    onUpdateSegmentGroups: () => {},
  };

  /**
   * This may seem anti-pattern at a glance if you have read the following article:
   * https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
   *
   * But our case is different:
   * 1) we don't need to maintain an internal "draft" state when the component is used
   *    inside a parent one from where users can pass down data via props;
   * 2) we want to use the internal state for demoing interactivity when the parent
   *    component is not presented (no new props as we interact with the component)
   * 3) given 2), we still want to allow users to override the internal state via props
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const _hashKey = nextProps.selected.join();
    // the _hashKey is used to determine whether the input data has changed, here we cannot
    // simply compare nextProps.selected vs. prevState.selected due to the above reasons 2)
    if (_hashKey !== prevState._hashKey) {
      return {
        _hashKey,
        selected: nextProps.selected,
        candidates: nextProps.candidates,
      };
    }
    return prevState;
  }

  _updateSelectedSegmentGroups = ({groupId, segmentId}) => {
    const newSelected = updateSegmentGroups(
      this.state.selected,
      groupId,
      segmentId
    );
    // update the internal state, then notify the parent component to update theirs
    this.setState({selected: newSelected}, () =>
      this.props.onUpdateSegmentGroups(newSelected)
    );
  };

  render() {
    const {
      candidates,
      selected: [groupA, groupB],
    } = this.state;

    return (
      <SegmentPanel>
        <SegmentButtonGroup
          id={0}
          color={COLORS.PINK}
          candidates={candidates}
          selected={groupA}
          onSelect={this._updateSelectedSegmentGroups}
        />
        <SegmentButtonGroup
          id={1}
          color={COLORS.BLUE}
          candidates={candidates}
          selected={groupB}
          onSelect={this._updateSelectedSegmentGroups}
        />
      </SegmentPanel>
    );
  }
}
