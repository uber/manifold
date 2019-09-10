// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';

// COMPONENTS
import SegmentPanel from './segment-panel';
import {Button} from 'antd';

// CONSTANTS
import {FEATURE_TYPE} from './constants';

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

const Footer = styled.div`
  display: flex;
  justify-content: space-between;

  ${props =>
    props.marginTop &&
    css`
      margin-top: 12px;
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
    attributes: PropTypes.arrayOf(
      PropTypes.shape({
        // attribute name, required
        key: PropTypes.string.isRequired,
        type: PropTypes.PropTypes.oneOf([
          FEATURE_TYPE.BOOLEAN,
          FEATURE_TYPE.CATEGORICAL,
          FEATURE_TYPE.NUMERICAL,
        ]),
        // attribute values, optional, feature distribution will be skipped if null or empty
        values: PropTypes.arrayOf(PropTypes.any),
        // distribution: value histogram, optional, will be derived if values is given
        distribution: PropTypes.arrayOf(PropTypes.any),
        // [min, ..., max] for numerical attribute and [enums] for categorical attribute
        domain: PropTypes.arrayOf(PropTypes.any),
      })
    ).isRequired,
    // callback function to popup changes in filter
    updateSegmentFilters: PropTypes.func,
  };

  static defaultProps = {
    attributes: [],
    updateSegmentFilters: () => {},
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

  // callback function poping up updated segment filter settings
  _handleUpdateSegments = () => {
    this.props.updateSegmentFilters(this.state.segments);
    this.setState({segmentsUpdated: false});
  };

  _handleAppendSegment = () => {
    const {segments} = this.state;
    this.setState({segments: segments.concat({key: randomId()})});
  };

  _handleRemoveSegment = key => {
    const {segments} = this.state;
    this.setState({
      segments: segments.filter(segment => segment.key !== key),
    });
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

  _renderFooter = () => {
    const {segments, segmentsUpdated} = this.state;
    const hasSegment = (segments || []).length > 0;
    const appendButtonType = hasSegment ? 'default' : 'primary';
    const updateButtonType =
      hasSegment && segmentsUpdated ? 'primary' : 'default';
    return (
      // add padding if segment list is not empty
      <Footer marginTop={hasSegment}>
        <Button
          type={appendButtonType}
          icon="plus"
          size="small"
          onClick={this._handleAppendSegment}
        >
          Add Segment
        </Button>
        <Button
          type={updateButtonType}
          icon="check"
          size="small"
          onClick={this._handleUpdateSegments}
        >
          Update
        </Button>
      </Footer>
    );
  };

  render() {
    const {attributes} = this.props;
    if (!attributes || !attributes.length) {
      return null;
    }

    return (
      <SegmentPanelListContainer withPadding={true}>
        {this._renderSegmentPanels()}
        {this._renderFooter()}
      </SegmentPanelListContainer>
    );
  }
}
