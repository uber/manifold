import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import ContainerDimensions from 'react-container-dimensions';
import styled from 'styled-components';
import {connect} from '../custom-connect';

import {COLORS} from '../constants';
import {updateSelectedInstances} from '../actions';
import {getSegmentedRawFeatures} from '../selectors/compute';
import {getGeoPositions, getSelectedInstances} from '../selectors/base';
import {getFeatures} from '../selectors/adaptors';
import FeatureListView from 'packages/feature-list-view';
import {LegendGroup} from 'packages/mlvis-common/ui';
import KeplerGl from 'kepler.gl';

const LEGEND_DATA = [
  {id: 0, name: 'data group 0'},
  {id: 1, name: 'data group 1'},
];

const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';

const Container = styled.div`
  overflow: scroll;
  width: 100%;
  height: 100%;
`;

const StyledLegend = styled(LegendGroup)`
  margin-top: 10px;
`;

const mapDispatchToProps = {updateSelectedInstances};
const mapStateToProps = (state, props) => {
  return {
    data: getFeatures(state),
    rawFeatures: getSegmentedRawFeatures(state),
    geoPositions: getGeoPositions(state),
    selectedInstances: getSelectedInstances(state),
  };
};

export class FeatureAttributionContainer extends PureComponent {
  static propTypes = {
    /* function to select manifold state from redux state of an application; `state => state.path.to.manifold.state` */
    selector: PropTypes.func,
    // todo: update with detailed propTypes
    data: PropTypes.arrayOf(PropTypes.object),
    colors: PropTypes.arrayOf(PropTypes.string),
    rawFeatures: PropTypes.arrayOf(PropTypes.array),
    geoPositions: PropTypes.array,
    selectedInstances: PropTypes.array,
  };

  static defaultProps = {
    features: [],
    colors: [COLORS.BLUE, COLORS.PINK],
  };

  render() {
    const {
      selector,
      data,
      colors,
      geoPositions,
      selectedInstances,
    } = this.props;
    if (!data || data.length === 0) {
      return null;
    }
    return (
      <Container>
        <StyledLegend data={LEGEND_DATA} colorScale={id => colors[id]} />
        <ContainerDimensions>
          {({width, height}) => (
            <div>
              {geoPositions && (
                <KeplerGl
                  mapboxApiAccessToken={
                    process.env.MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN
                  }
                  getState={state => selector(state).keplerGl}
                  id="map"
                  width={width}
                  height={450}
                />
              )}
              <FeatureListView
                data={data}
                width={width}
                colors={colors}
                selectedInstances={selectedInstances}
              />
            </div>
          )}
        </ContainerDimensions>
      </Container>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureAttributionContainer);
