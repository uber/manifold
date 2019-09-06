import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Cancel} from 'packages/mlvis-common/icons';

const Container = styled.div`
  transition: 0.5s;
  transition-timing-function: ease-in-out;
  width: ${props => (props.isOpen ? props.width + 'px' : 0)};
  padding: ${props => (props.isOpen ? '12px 24px' : '12px 0')};
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  div {
    opacity: ${props => (props.isOpen ? 1 : 0)};
    transition: 0.5s;
    transition-delay: 0.5s;
  }
`;

const StyledIcon = styled.div``;

const IconButton = styled.div`
  cursor: pointer;
  margin-right: 12px;
  padding: 12px;
  position: absolute;
  transition: 0.3s;
  transition-delay: 0.2s;
  right: 0;
  top: 0px;
`;

export default class SideBar extends PureComponent {
  static propTypes = {
    /** True if the side bar is open. */
    isOpen: PropTypes.bool,
    /** Width of the side bar. */
    width: PropTypes.number,
    /** Callback on toggle open the side bar. */
    onToggleOpen: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    width: 300,
    onToggleOpen: () => {},
  };

  _onClose = () => {
    this.props.onToggleOpen(false);
  };

  render() {
    const {children, isOpen, width, className} = this.props;
    return (
      <Container isOpen={isOpen} width={width} className={className}>
        <IconButton onClick={this._onClose}>
          <StyledIcon as={Cancel} height="10" width="10" color="#aaa" />
        </IconButton>
        {children}
      </Container>
    );
  }
}
