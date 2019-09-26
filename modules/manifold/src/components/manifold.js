import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {BaseProvider} from 'baseui';
// import {theme} from '../styles';
import {connect} from '../custom-connect';
import {
  THEME,
  THEME_COLOR,
  VIEW_MODE,
  VIEW_TAB,
  VIEW_NAME,
  HELP_TYPE,
  HELP_PAGES,
} from '../constants';
import {StyledControlContainer} from './ui/styled-components';
import {Headline, HelpDialog} from './ui';
import PerformanceComparisonControlContainer from './performance-comparison-control-container';
import FeatureAttributionControlContainer from './feature-attribution-control-container';
import PerformanceComparisonContainer from './performance-comparison-container';
import FeatureAttributionContainer from './feature-attribution-container';
import GeoFeatureContainer from './geo-feature-container';

const mapStateToProps = (state, props) => {
  // TODO; further investigate preferred pattern of connecting component to state
  // i.e. HOC or custom-connect
  const {selector, ...otherProps} = props;
  return {
    dataLoadingError: state.dataLoadingError,
    ...otherProps,
  };
};

const engine = new Styletron();

const HEADLINE_HEIGHT = 48;
const CONTROL_HEIGHT = 100;
const CONTROL_WIDTH = 300;
const MIN_CHART_WIDTH = 400;
const MIN_CHART_HEIGHT = 300;
const PANEL_PADDING = 20;
const THUMBNAIL_HEIGHT = 180;

const Container = styled.div`
  font-family: 'Helvetica Neue', Helvetica, sans-serif;
  font-size: 14px;
  display: flex;
  background: #fff;
  width: ${props => `${props.width}px`};
  height: ${props => `${props.height}px`};
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
      : `${CONTROL_WIDTH}px minmax(${MIN_CHART_WIDTH}px, 1fr)`};
  grid-template-rows: ${props =>
    props.viewMode === VIEW_MODE.COORDINATED
      ? `${HEADLINE_HEIGHT}px ${CONTROL_HEIGHT}px minmax(${MIN_CHART_HEIGHT}px, 100%)`
      : `${HEADLINE_HEIGHT}px minmax(${MIN_CHART_HEIGHT}px, 100%)`};
  grid-template-areas: ${props =>
    props.viewMode === VIEW_MODE.COORDINATED
      ? '"headline1 headline2" "control1 control2" "chart1 chart2"'
      : '"control headline" "control chart"'};
`;

const Panel = styled.div`
  padding: ${props => (props.padded ? '0 ' + PANEL_PADDING + 'px' : '0')};
  display: ${props => (props.isShown ? 'flex' : 'none')};
  flex-direction: ${props => props.flexDirection || 'column'};
  grid-area: ${props => props.gridArea};
  border-right: ${props => (props.borderRight ? '1px solid #dfdfdf' : 'none')};
  border-bottom: ${props =>
    props.borderBottom ? '1px solid #dfdfdf' : 'none'};
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  background-color: #fafafa;
  height: 100%;
  overflow-y: scroll;
`;

const SidePanelControlSection = styled.div``;

const Thumbnail = styled.div`
  display: flex;
  border: 1px solid #dfdfdf;
  padding: 10px;
`;

class Manifold extends PureComponent {
  static propTypes = {
    selector: PropTypes.func,
  };

  static defaultProps = {
    selector: () => {},
  };

  state = {
    isHelpMessageModalOpen: false,
    viewMode: VIEW_MODE.SINGLE,
    // TODO move the viewTab to root reducer, need to switch to the
    // feature attribution view in manual segmentation mode
    viewTab: VIEW_TAB.PERF,
    helpType: null,
  };

  _toggleModal = shouldOpen => {
    const nextHelpType = shouldOpen ? this.state.helpType : null;
    this.setState({
      isHelpMessageModalOpen: shouldOpen,
      helpType: nextHelpType,
    });
  };

  _toggleHelpType = helpType => {
    const nextHelpType = helpType === this.state.helpType ? null : helpType;
    const shouldModalOpen = nextHelpType !== null;
    this.setState({
      helpType: nextHelpType,
      isHelpMessageModalOpen: shouldModalOpen,
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
    const {selector, dataLoadingError, mapboxToken, width, height} = this.props;
    const {isHelpMessageModalOpen, viewMode, viewTab, helpType} = this.state;
    const showBoth = viewMode === VIEW_MODE.COORDINATED;
    const showView1 = showBoth || viewTab === VIEW_TAB.PERF;
    const showView2 = showBoth || viewTab === VIEW_TAB.FEATURE;
    const mainPanelWidth = showBoth
      ? width / 2 - 2 * PANEL_PADDING
      : width - CONTROL_WIDTH - 2 * PANEL_PADDING;
    const mainPanelHeight = showBoth
      ? height - HEADLINE_HEIGHT - CONTROL_HEIGHT
      : height - HEADLINE_HEIGHT;
    const sidePanelWidth = CONTROL_WIDTH - 2 * PANEL_PADDING;

    if (dataLoadingError) {
      return <ErrorContainer> {dataLoadingError.message} </ErrorContainer>;
    }
    return (
      <StyletronProvider value={engine}>
        <BaseProvider theme={THEME}>
          <Container width={width} height={height}>
            <Content viewMode={viewMode}>
              <Panel
                key="headline"
                gridArea="headline"
                isShown={!showBoth}
                borderBottom
                padded
                flexDirection="row"
              >
                <Headline
                  headers={[VIEW_NAME.PERF, VIEW_NAME.FEATURE]}
                  onTabChange={this._toggleViewTab}
                  isCoordinated={showBoth}
                  showHelp={helpType === HELP_TYPE.PERF}
                  onClickSplit={this._toggleViewMode}
                  onClickHelp={() =>
                    this._toggleHelpType(
                      showView1 ? HELP_TYPE.PERF : HELP_TYPE.FEATURE
                    )
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
                padded
                flexDirection="row"
              >
                <Headline
                  headers={[VIEW_NAME.PERF]}
                  themeColor={THEME_COLOR}
                  isCoordinated={showBoth}
                  showHelp={helpType === HELP_TYPE.PERF}
                  onClickSplit={this._toggleViewMode}
                  onClickHelp={() => this._toggleHelpType(HELP_TYPE.PERF)}
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
                  showHelp={helpType === HELP_TYPE.FEATURE}
                  onClickSplit={this._toggleViewMode}
                  onClickHelp={() => this._toggleHelpType(HELP_TYPE.FEATURE)}
                />
              </Panel>

              <Panel
                key="control1"
                gridArea="control1"
                isShown={showBoth}
                borderRight
                padded
              >
                <StyledControlContainer
                  as={PerformanceComparisonControlContainer}
                  flexDirection={showBoth ? 'row' : 'column'}
                  selector={selector}
                />
              </Panel>
              <Panel
                key="control2"
                gridArea="control2"
                isShown={showBoth}
                padded
              >
                <StyledControlContainer
                  as={FeatureAttributionControlContainer}
                  flexDirection={showBoth ? 'row' : 'column'}
                  selector={selector}
                />
              </Panel>

              <Panel key="control-both" gridArea="control" isShown={!showBoth}>
                <SidePanel>
                  <SidePanelControlSection>
                    <StyledControlContainer
                      as={PerformanceComparisonControlContainer}
                      flexDirection="column"
                      width={sidePanelWidth}
                      selector={selector}
                    />
                    <StyledControlContainer
                      as={FeatureAttributionControlContainer}
                      flexDirection="column"
                      width={sidePanelWidth}
                      selector={selector}
                    />
                  </SidePanelControlSection>
                  {showView2 && (
                    <Thumbnail>
                      <PerformanceComparisonContainer
                        selector={selector}
                        isThumbnail
                        width={sidePanelWidth}
                        height={THUMBNAIL_HEIGHT}
                      />
                    </Thumbnail>
                  )}
                </SidePanel>
              </Panel>

              <Panel
                key="chart1"
                gridArea={showBoth ? 'chart1' : 'chart'}
                isShown={showView1}
                borderRight={showBoth}
                padded
              >
                <PerformanceComparisonContainer
                  selector={selector}
                  width={mainPanelWidth}
                  height={mainPanelHeight}
                />
              </Panel>
              <Panel
                key="chart2"
                gridArea={showBoth ? 'chart2' : 'chart'}
                isShown={showView2}
                padded
              >
                <GeoFeatureContainer
                  selector={selector}
                  width={mainPanelWidth}
                  mapboxToken={mapboxToken}
                />
                <FeatureAttributionContainer
                  selector={selector}
                  width={mainPanelWidth}
                />
              </Panel>
            </Content>
            <HelpDialog
              pages={HELP_PAGES[helpType]}
              isOpen={isHelpMessageModalOpen}
              onToggleOpen={this._toggleModal}
              themeColor={THEME_COLOR}
            />
          </Container>
        </BaseProvider>
      </StyletronProvider>
    );
  }
}

export default connect(mapStateToProps)(Manifold);
