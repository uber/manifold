// @noflow
import React, {PureComponent} from 'react';

const COLORS = ['#ff0099', '#999999'];
const TEXTS = ['Treatment', 'Control'];

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
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%) rotate(90deg)',
        height: '12px',
      }}
    >
      {text}
    </span>
  </div>
);

export default class SegmentGrouping extends PureComponent {
  static displayName = 'SegmentGrouping';

  static defaultProps = {
    width: '36px',
    bracketWidth: '6px',
    segmentGroups: [],
    yScale: () => 0,
    padding: {
      top: 0,
    },
  };

  get style() {
    return {
      main: {
        paddingTop: this.props.padding.top,
      },
    };
  }

  render() {
    const {segmentGroups, yScale, width, bracketWidth} = this.props;
    return (
      <div style={this.style.main}>
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
      </div>
    );
  }
}
