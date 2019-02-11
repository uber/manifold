// @noflow
import React, {PureComponent} from 'react';
import LegendItem from './legend-item';

export default class LegendGroup extends PureComponent {
  static defaultProps = {
    width: 0,
    height: 0,
    data: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedModels: props.data.map(d => ({
        d: false,
      })),
    };
  }

  render() {
    const {colorScale, data, onModelSelect, selectedModels} = this.props;
    return (
      <div>
        {data.map(({id, name}, i) => (
          <LegendItem
            id={id}
            key={id}
            text={name}
            color={colorScale(id)}
            selected={selectedModels[id]}
            onModelClick={() => onModelSelect(id)}
          />
        ))}
      </div>
    );
  }
}
