// @noflow
import React, {PureComponent} from 'react';
import ContainerDimensions from 'react-container-dimensions';
import styled from 'styled-components';
import {connect} from '../custom-connect';

import {updateDivergenceThreshold, exportFeatureEncoder} from '../actions';
import {getSegmentedRawFeatures} from '../selectors/compute';
import {getDivergenceThreshold, getGeoPositions} from '../selectors/base';
import {getFeatures} from '../selectors/adaptors';
import FeatureListView from 'packages/feature-list-view';
// import ContextualMap from 'packages/contextual-map';

// const MAPBOX_ACCESS_TOKEN =
//   'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';

const Container = styled.div`
  overflow: scroll;
  width: 100%;
  height: 100%;
`;

const mapDispatchToProps = {updateDivergenceThreshold, exportFeatureEncoder};
const mapStateToProps = (state, props) => {
  return {
    features: getFeatures(state),
    divergenceThreshold: getDivergenceThreshold(state),
    rawFeatures: getSegmentedRawFeatures(state),
    geoPositions: getGeoPositions(state),
  };
};

class FeatureAttributionContainer extends PureComponent {
  static defaultProps = {
    features: [],
  };

  render() {
    const {features} = this.props;
    if (!features || features.length === 0) {
      return null;
    }
    return (
      <Container>
        <ContainerDimensions>
          {({width, height}) => (
            <div>
              {/* {geoPositions && (
                <ContextualMap
                  mapboxToken={
                    process.env.MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN
                  }
                  data={rawFeatures}
                  showArcs={false}
                  getPositions={geoPositions}
                  width={width}
                  height={450}
                />
              )} */}
              <FeatureListView features={features} width={width} />
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
