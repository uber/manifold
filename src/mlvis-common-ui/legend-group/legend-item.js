// @noflow
import React, {PureComponent} from 'react';

export default class LegendItem extends PureComponent {
  static displayName = 'LegendItem';

  static defaultProps = {
    width: 0,
    height: 0,
    data: {},
  };

  render() {
    const {text, color, selected, onModelClick} = this.props;
    return (
      <span id={`legend-${text}`} onClick={onModelClick}>
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '8px',
            backgroundColor: color,
            opacity: selected ? 1 : 0.2,
            cursor: 'pointer',
          }}
        />
        <span> {text} </span>
      </span>
    );
  }
}
