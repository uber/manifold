import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Cancel} from 'packages/mlvis-common/icons';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

const SegmentButtonGroupPanel = styled.div`
  background: #f5f5f5;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  width: 100%;
  min-width: 210px;
  height: 36px;
  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

const GroupTitle = styled.div`
  display: flex;
  align-items: center;
`;

const ColorLegend = styled.div`
  background: ${props => props.color || '#000'};
  margin-right: 6px;
  width: 12px;
  height: 12px;
`;

const DeleteButton = styled(Cancel)`
  color: #7a7a7a;
  height: 10px;
  :hover {
    cursor: pointer;
  }
`;

const CircleButton = styled.button`
  background: ${props => (props.selected ? '#000' : '#DDD')};
  color: ${props => (props.selected ? '#FFF' : '#000')};
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  margin: auto 2px;
  padding: 0;
  font-size: 0.7em;
  font-weight: 600;
  line-height: 1;
  :focus {
    outline: 0;
  }
  :hover {
    cursor: pointer;
  }
`;

export default class SegmentButtonGroup extends PureComponent {
  static propTypes = {
    /** index of the segment group, required for distinguishing which group triggered the update */
    id: PropTypes.number.isRequired,
    /** the fill color for the squared color legend for each segment group */
    color: PropTypes.string,
    /** all candidate segment indices */
    candidates: PropTypes.arrayOf(PropTypes.number),
    /** the selected segment indices */
    selected: PropTypes.arrayOf(PropTypes.number),
    /** callback function to surface which segemnt has been updated */
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    id: undefined,
    color: '#999999',
    candidates: [],
    selected: [],
    onSelect: () => {},
  };

  render() {
    const {id, color, candidates, selected, onSelect, children} = this.props;

    return (
      <Container>
        <SegmentButtonGroupPanel key={id}>
          <GroupTitle>
            <ColorLegend color={color} /> Segments
          </GroupTitle>
          <div>
            {!children &&
              candidates.map(candidate => {
                const isSelected = selected.includes(candidate);
                return (
                  <CircleButton
                    key={candidate}
                    selected={isSelected}
                    onClick={() =>
                      onSelect({groupId: id, segmentId: candidate})
                    }
                  >
                    {candidate}
                  </CircleButton>
                );
              })}
          </div>
          <DeleteButton />
        </SegmentButtonGroupPanel>
        {children}
      </Container>
    );
  }
}
