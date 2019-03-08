// @noflow
import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {withDerivedData} from './utils';

const COLORS = ['#ff0099', '#999999'];
const TEXTS = ['Treatment', 'Control'];

const Container = styled.div`
  padding-top: ${props => props.paddingTop}px;
  padding-left: ${props => props.paddingLeft}px;
`;

const SegmentGroupingUnit = ({
  segmentGroup,
  yScale,
  width,
  bracketWidth,
  color,
  text,
}) => (
  <div
    style={{
      marginTop: `${yScale.paddingOuter() * yScale.step()}px`,
      height: `${segmentGroup.length * yScale.step() -
        yScale.paddingInner() * yScale.step()}px`,
      transition: '0.5s linear',
      fontSize: '12px',
      display: 'flex',
      align: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      width,
    }}
  >
    <div
      style={{
        width: bracketWidth,
        border: `1px solid  ${color}`,
        borderLeft: 'none',
      }}
    />
    <span
      style={{
        color,
        position: 'absolute',
        top: '50%',
        left: '100%',
        transform: 'translate(-50%, -50%) rotate(90deg)',
        height: '12px',
      }}
    >
      {text}
    </span>
  </div>
);

class SegmentGrouping extends PureComponent {
  static defaultProps = {
    width: '16px',
    bracketWidth: '6px',
    segmentGroups: [],
    yScale: () => 0,
    padding: {
      top: 0,
    },
  };

  render() {
    const {segmentGroups, yScale, width, bracketWidth, padding} = this.props;
    return (
      <Container paddingTop={padding.top} paddingLeft={8} width={width}>
        {segmentGroups.map((segmentGroup, i) => (
          <SegmentGroupingUnit
            key={i}
            segmentGroup={segmentGroup}
            yScale={yScale}
            width={width}
            bracketWidth={bracketWidth}
            color={COLORS[i]}
            text={TEXTS[i]}
          />
        ))}
      </Container>
    );
  }
}

export default withDerivedData(SegmentGrouping);
