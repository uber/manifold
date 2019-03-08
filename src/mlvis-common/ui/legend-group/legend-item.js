// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 16px;
`;

const Icon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: ${props => props.color};
  opacity: ${props => (props.selected ? 1 : 0.6)};
  margin-right: 4px;
`;

export default class LegendItem extends PureComponent {
  static propTypes = {
    text: PropTypes.string,
    color: PropTypes.string,
    selected: PropTypes.bool,
    onModelClick: PropTypes.func,
  };

  static defaultProps = {
    text: '',
    color: '#000',
    selected: false,
    onModelClick: () => {},
  };

  render() {
    const {text, color, selected, onModelClick} = this.props;
    return (
      <Container onClick={onModelClick}>
        <Icon color={color} selected={selected} />
        <span> {text} </span>
      </Container>
    );
  }
}
