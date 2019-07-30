// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {withXYScales} from 'packages/mlvis-common/utils';
import {
  CHART_DEFAULT_PROPS,
  CHART_PROP_TYPES,
} from 'packages/mlvis-common/constants';

const COLORS = ['#D64A62', '#528AD0'];
const TEXTS = ['Group 0', 'Group 1'];
const LEFT_PADDING = 5;

const Container = styled.div`
  padding-top: ${props => props.paddingTop}px;
  padding-left: ${props => props.paddingLeft}px;
`;

const StyledUnit = styled.div`
  margin-top: ${props => props.marginTop}px;
  transition: 0.5s linear;
  font-size: 12px;
  display: flex;
  align: center;
  justify-content: space-between;
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`;

const StyledUnitBracket = styled.div`
  width: ${props => props.width}px;
  border: ${props => '1px solid ' + props.color};
  border-left: none;
`;

const StyledUnitText = styled.span`
  color: ${props => props.color};
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translate(-50%, -50%) rotate(90deg);
  height: 12px;
  white-space: nowrap;
`;

const SegmentGroupingUnit = ({
  marginTop,
  height,
  width,
  bracketWidth,
  color,
  text,
}) => (
  <StyledUnit marginTop={marginTop} height={height} width={width}>
    <StyledUnitBracket width={bracketWidth} color={color} />
    <StyledUnitText color={color}>{text}</StyledUnitText>
  </StyledUnit>
);

class SegmentGrouping extends PureComponent {
  static propTypes = {
    ...CHART_PROP_TYPES,
    /** width of the grouping bracket **/
    bracketWidth: PropTypes.number,
    /** grouped segment IDs, e.g. [[1], [0, 2, 3]] **/
    segmentGroups: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  };

  static defaultProps = {
    ...CHART_DEFAULT_PROPS,
    width: 16,
    bracketWidth: 6,
    segmentGroups: [[], []],
  };

  render() {
    const {segmentGroups, yScale, width, bracketWidth, padding} = this.props;
    return (
      <Container
        paddingTop={padding.top}
        paddingLeft={LEFT_PADDING}
        width={width}
      >
        {segmentGroups.map((segmentGroup, i) => (
          <SegmentGroupingUnit
            key={i}
            segmentGroup={segmentGroup}
            height={
              segmentGroup.length * yScale.step() -
              yScale.paddingInner() * yScale.step()
            }
            marginTop={yScale.paddingOuter() * yScale.step()}
            width={width - LEFT_PADDING}
            bracketWidth={bracketWidth}
            color={COLORS[i]}
            text={TEXTS[i]}
          />
        ))}
      </Container>
    );
  }
}

export default withXYScales(SegmentGrouping);
