// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import LegendItem from './legend-item';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

export default class LegendGroup extends PureComponent {
  static propTypes = {
    /** Array of legend objects {id, name} */
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
    /** Color scale function */
    colorScale: PropTypes.func.isRequired,
    /** Callback on model selected */
    onModelSelect: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    onModelSelect: () => {},
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
    const {colorScale, data, onModelSelect, className} = this.props;

    return (
      <Container className={className}>
        {data.map(({id, name}, i) => (
          <LegendItem
            key={id}
            text={name}
            color={colorScale(id)}
            selected={this.state.selectedModels[id]}
            onModelClick={() => onModelSelect(id)}
          />
        ))}
      </Container>
    );
  }
}
