import React, {PureComponent} from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > label {
    color: #999;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    padding: 10px 0;
  }
  & > div {
    color: #000;
    font-size: 13px;
  }
`;

export default class Control extends PureComponent {
  render() {
    const {name, children, className} = this.props;
    return (
      <Container className={className}>
        <label> {name} </label>
        {children}
      </Container>
    );
  }
}
