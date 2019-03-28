// @noflow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {connect} from '../custom-connect';
import {THEME_COLOR, VIEW_MODE, VIEW_TAB, VIEW_NAME, HINTS} from '../constants';

import {Headline, SideBar} from 'packages/mlvis-common/ui';
import MultiComparisonControlContainer from './multi-comparison-control-container';
import FeaturesControlContainer from './features-control-container';
import FiltersContainer from './filters-container';
import MultiModelComparisonContainer from './multi-model-comparison-container';
import FeatureAttributionContainer from './feature-attribution-container';
import Hints from './hints';

const mapStateToProps = (state, props) => {
  // TODO; further investigate preferred pattern of connecting component to state
  // i.e. HOC or custom-connect
  const {selector, ...otherProps} = props;
  return {
    dataLoadingError: state.dataLoadingError,
    ...otherProps,
  };
};

const HEADLINE_HEIGHT = 48;
const CONTROL_HEIGHT = 100;
const MIN_CHART_WIDTH = 400;
const MIN_CHART_HEIGHT = 300;

const Container = styled.div`
  fontfamily: 'Helvetica Neue', Helvetica, sans-serif;
  font-size: 14px;
  display: flex;
  background: #fff;
  height: 100vh;
`;

const ErrorContainer = styled(Container)`
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-gap: 0px;

  /* toggle layout based on viewModel */
  grid-template-columns: ${props =>
    props.viewMode === VIEW_MODE.COORDINATED
      ? `repeat(2, minmax(${MIN_CHART_WIDTH}px, 50%))`
      : `360px minmax(${MIN_CHART_WIDTH}px, 1fr)`};
  grid-template-rows: ${props =>
    props.viewMode === VIEW_MODE.COORDINATED
      ? `${HEADLINE_HEIGHT}px ${CONTROL_HEIGHT}px minmax(${MIN_CHART_HEIGHT}px, 90%)`
      : `${HEADLINE_HEIGHT}px minmax(${MIN_CHART_HEIGHT}px, 90%)`};
  grid-template-areas: ${props =>
    props.viewMode === VIEW_MODE.COORDINATED
      ? '"headline1 headline2" "control1 control2" "chart1 chart2"'
      : '"control headline" "control chart"'};
`;

const StyledSideBar = styled(SideBar)`
  border-left: 1px solid #dfdfdf;
`;

const Panel = styled.div`
  padding: 0 20px;
  display: ${props => (props.isShown ? 'flex' : 'none')};
  flex-direction: ${props => props.flexDirection || 'column'};
  grid-area: ${props => props.gridArea};
  border-right: ${props => (props.borderRight ? '1px solid #dfdfdf' : 'none')};
  border-bottom: ${props =>
    props.borderBottom ? '1px solid #dfdfdf' : 'none'};
`;

const StyledControlContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.flexDirection};
`;

class Manifold extends PureComponent {
  static propTypes = {
    selector: PropTypes.func,
  };

  static defaultProps = {
    selector: () => {},
  };

  state = {
    isSideBarOpen: false,
    viewMode: VIEW_MODE.COORDINATED,
    viewTab: VIEW_TAB.PERF,
    hintType: null,
  };

  _toggleSideBar = shouldOpen => {
    const nextHintType = shouldOpen ? this.state.hintType : null;
    this.setState({
      isSideBarOpen: shouldOpen,
      hintType: nextHintType,
    });
  };

  _toggleHintType = hintType => {
    const nextHintType = hintType === this.state.hintType ? null : hintType;
    const shouldSideBarOpen = nextHintType !== null;
    this.setState({
      hintType: nextHintType,
      isSideBarOpen: shouldSideBarOpen,
    });
  };

  _toggleViewMode = () => {
    const {viewMode} = this.state;
    this.setState({
      viewMode:
        viewMode === VIEW_MODE.SINGLE
          ? VIEW_MODE.COORDINATED
          : VIEW_MODE.SINGLE,
    });
  };

  _toggleViewTab = (tabName, tabId) => {
    const tabs = [VIEW_TAB.PERF, VIEW_TAB.FEATURE];
    this.setState({
      viewTab: tabs[tabId],
    });
  };

  render() {
    const {selector, dataLoadingError} = this.props;
    const {isSideBarOpen, viewMode, viewTab, hintType} = this.state;
    const showBoth = viewMode === VIEW_MODE.COORDINATED;
    const showView1 = showBoth || viewTab === VIEW_TAB.PERF;
    const showView2 = showBoth || viewTab === VIEW_TAB.FEATURE;
    if (dataLoadingError) {
      return <ErrorContainer> {dataLoadingError.message} </ErrorContainer>;
    }
    return (
      <Container>
        <Content viewMode={viewMode}>
          <Panel
            key="headline"
            gridArea="headline"
            isShown={!showBoth}
            borderBottom
            flexDirection="row"
          >
            <Headline
              headers={[VIEW_NAME.PERF, VIEW_NAME.FEATURE]}
              onTabChange={this._toggleViewTab}
              isCoordinated={showBoth}
              showHelp={hintType === HINTS[viewTab].HELP}
              showInsight={hintType === HINTS[viewTab].INSIGHT}
              onClickSplit={this._toggleViewMode}
              onClickHelp={() => this._toggleHintType(HINTS[viewTab].HELP)}
              onClickInsight={() =>
                this._toggleHintType(HINTS[viewTab].INSIGHT)
              }
              themeColor={THEME_COLOR}
            />
          </Panel>
          <Panel
            key="headline1"
            gridArea="headline1"
            isShown={showBoth}
            borderBottom
            borderRight
            flexDirection="row"
          >
            <Headline
              headers={[VIEW_NAME.PERF]}
              themeColor={THEME_COLOR}
              isCoordinated={showBoth}
              showHelp={hintType === HINTS.PERF.HELP}
              showInsight={hintType === HINTS.PERF.INSIGHT}
              onClickSplit={this._toggleViewMode}
              onClickHelp={() => this._toggleHintType(HINTS.PERF.HELP)}
              onClickInsight={() => this._toggleHintType(HINTS.PERF.INSIGHT)}
            />
          </Panel>
          <Panel
            key="headline2"
            gridArea="headline2"
            isShown={showBoth}
            borderBottom
            flexDirection="row"
          >
            <Headline
              headers={[VIEW_NAME.FEATURE]}
              themeColor={THEME_COLOR}
              isCoordinated={showBoth}
              showHelp={hintType === HINTS.FEATURE.HELP}
              showInsight={hintType === HINTS.FEATURE.INSIGHT}
              onClickSplit={this._toggleViewMode}
              onClickHelp={() => this._toggleHintType(HINTS.FEATURE.HELP)}
              onClickInsight={() => this._toggleHintType(HINTS.FEATURE.INSIGHT)}
            />
          </Panel>

          <Panel
            key="control1"
            gridArea={showBoth ? 'control1' : 'control'}
            isShown={showView1}
            borderRight
          >
            <StyledControlContainer
              as={MultiComparisonControlContainer}
              flexDirection={showBoth ? 'row' : 'column'}
              selector={selector}
            />
            <FiltersContainer selector={selector} />
          </Panel>
          <Panel
            key="control2"
            gridArea={showBoth ? 'control2' : 'control'}
            isShown={showView2}
            borderRight={!showBoth && showView2}
          >
            <StyledControlContainer
              as={FeaturesControlContainer}
              flexDirection={showBoth ? 'row' : 'column'}
              selector={selector}
            />
          </Panel>

          <Panel
            key="chart1"
            gridArea={showBoth ? 'chart1' : 'chart'}
            isShown={showView1}
            borderRight={showBoth}
          >
            <MultiModelComparisonContainer selector={selector} />
          </Panel>
          <Panel
            key="chart2"
            gridArea={showBoth ? 'chart2' : 'chart'}
            isShown={showView2}
          >
            <FeatureAttributionContainer selector={selector} />
          </Panel>
        </Content>
        <StyledSideBar
          width={300}
          isOpen={isSideBarOpen}
          onToggleOpen={this._toggleSideBar}
        >
          <Hints hintType={hintType} />
        </StyledSideBar>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Manifold);
