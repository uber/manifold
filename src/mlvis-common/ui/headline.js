// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {hexToRGB} from './utils';
import {Tab, TabGroup} from './tabs';
import {Question, Split} from '../icons';

const Container = styled.div`
  width: 100%
  display: flex;
  align-items: stretch;
  justify-content: space-between;
`;

const StyledIcon = styled.div``;

const IconButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 5px;
  margin: 1px;
  background: ${props => hexToRGB(props.themeColor, props.isActive ? 0.1 : 0)};
  transition: 0.2s;
  :hover {
    background: ${props => hexToRGB(props.themeColor, 0.2)};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

export default class Headline extends PureComponent {
  static propTypes = {
    /** A set of tab title */
    headers: PropTypes.arrayOf(PropTypes.string),
    /** Theme color of the tab */
    themeColor: PropTypes.string,
    /** Enable to show help icon */
    showHelp: PropTypes.bool,
    /** Callback on tab changes */
    onTabChange: PropTypes.func,
    /** Callback on toggling help icon */
    onClickHelp: PropTypes.func,
  };

  static defaultProps = {
    headers: [],
    themeColor: '#000',
    showHelp: false,
    onTabChange: () => {},
    onClickHelp: () => {},
  };

  render() {
    const {
      headers,
      onTabChange,
      themeColor,
      isCoordinated,
      showHelp,
      onClickSplit,
      onClickHelp,
    } = this.props;

    const content =
      headers.length > 1 ? (
        <TabGroup
          tabs={headers}
          themeColor={themeColor}
          onTabChange={onTabChange}
        />
      ) : (
        <Tab themeColor={themeColor}> {headers[0]} </Tab>
      );
    return (
      <Container>
        {content}
        <ButtonGroup>
          <IconButton
            onClick={onClickSplit}
            isActive={isCoordinated}
            themeColor={themeColor}
          >
            <StyledIcon
              as={Split}
              height="18"
              width="18"
              color={isCoordinated ? themeColor : '#999'}
            />
          </IconButton>
          <IconButton
            onClick={onClickHelp}
            isActive={showHelp}
            themeColor={themeColor}
          >
            <StyledIcon
              as={Question}
              height={32}
              width={32}
              color={showHelp ? themeColor : '#999'}
            />
          </IconButton>
        </ButtonGroup>
      </Container>
    );
  }
}
