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
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      })
    ),
  };

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
      <Container>
        {data.map(({id, name}, i) => (
          <LegendItem
            key={id}
            text={name}
            color={colorScale(id)}
            selected={selectedModels[id]}
            onModelClick={() => onModelSelect(id)}
          />
        ))}
      </Container>
    );
  }
}
