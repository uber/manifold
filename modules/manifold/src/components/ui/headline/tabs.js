import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

export const Tab = styled.div`
  font-weight: 500;
  height: 100%
  width: max-content;
  padding-top: 12px;
  margin-right: 20px;
  cursor: ${props => (props.onClick ? 'pointer' : 'default')}
  border-bottom: ${props => '2px solid ' + props.themeColor};
  opacity: ${props => (props.isInactive ? 0.2 : 1)}
`;

export class TabGroup extends PureComponent {
  static defaultProps = {
    /** An array of tab titles */
    tabs: PropTypes.arrayOf(PropTypes.string),
    /** Callback on tab change */
    onTabChange: PropTypes.func,
    /** Theme colorof the tab */
    themeColor: PropTypes.string,
  };

  static defaultProps = {
    tabs: [],
    onTabChange: () => {},
    themeColor: '#000',
  };

  state = {
    activeTab: 0,
  };

  _onTabChange = (tab, i) => {
    const {onTabChange} = this.props;
    this.setState(
      {
        activeTab: i,
      },
      onTabChange(tab, i)
    );
  };

  render() {
    const {tabs, themeColor} = this.props;
    const {activeTab} = this.state;
    return (
      <Container>
        {tabs.map((tab, i) => (
          <Tab
            onClick={() => this._onTabChange(tab, i)}
            themeColor={themeColor}
            isInactive={i !== activeTab}
            key={i}
          >
            {tab}
          </Tab>
        ))}
      </Container>
    );
  }
}
