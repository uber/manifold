import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ContainerDimensions from 'react-container-dimensions';
import KeplerGl from 'kepler.gl';
import {addDataToMap} from 'kepler.gl/actions';

import GeoFeatureControl from './geo-feature-control';
import {connect} from '../custom-connect';
import {updateDisplayGeoFeatures, updateColorByFeature} from '../actions';

import {getDisplayGeoFeatures, getColorByFeature} from '../selectors/base';
import {
  getGroupedGeoFeatures,
  getHasGeoFeatures,
  getAvailableVisualChannelFeatures,
  getKeplerDatasets,
  getKeplerConfig,
} from '../selectors/kepler-selectors';

const mapStateToProps = state => {
  return {
    geoFeatures: getGroupedGeoFeatures(state),
    hasGeoFeatures: getHasGeoFeatures(state),
    keplerDatasets: getKeplerDatasets(state),
    keplerConfig: getKeplerConfig(state),
    visualChannelFeatures: getAvailableVisualChannelFeatures(state),
    displayGeoFeatures: getDisplayGeoFeatures(state),
    colorByFeature: getColorByFeature(state),
  };
};

const mapDispatchToProps = {
  addDataToMap,
  updateDisplayGeoFeatures,
  updateColorByFeature,
};

const Container = styled.div`
  :first-child {
    padding-top: 20px;
  }
  width: 100%;
  position: relative;
`;

export class GeoFeatureContainer extends PureComponent {
  static propTypes = {
    // todo: add detailed schema
    mapboxToken: PropTypes.string,
    keplerDatasets: PropTypes.arrayOf(PropTypes.object),
    keplerConfig: PropTypes.object,
    height: PropTypes.number,
    hasGeoFeatures: PropTypes.bool,
    selector: PropTypes.func.isRequired,
  };
  static defaultProps = {
    mapboxToken: '',
    keplerConfig: null,
    keplerDatasets: null,
    height: 450,
    hasGeoFeatures: false,
  };

  componentDidMount() {
    const {keplerDatasets, keplerConfig} = this.props;
    this.updateMap(keplerDatasets, keplerConfig);
  }

  componentDidUpdate(prevProps) {
    // keplerDatasets and keplerConfig are outputed by selectors (preventing unnecessary update)
    const {keplerDatasets, keplerConfig} = this.props;
    // Check whether these props have changed
    if (
      keplerDatasets !== prevProps.keplerDatasets ||
      keplerConfig !== prevProps.keplerConfig
    ) {
      // addDataToMap action to inject dataset into kepler.gl instance
      this.updateMap(keplerDatasets, keplerConfig);
    }
  }

  updateMap = (datasets, config) => {
    if (datasets && config) {
      this.props.addDataToMap({
        datasets,
        config,
      });
    }
  };

  render() {
    const {
      selector,
      mapboxToken,
      hasGeoFeatures,
      geoFeatures,
      displayGeoFeatures,
      visualChannelFeatures,
      colorByFeature,
      height,
    } = this.props;
    if (!hasGeoFeatures) {
      return null;
    }
    return (
      <Container>
        <ContainerDimensions>
          {({width}) => (
            <KeplerGl
              mapboxApiAccessToken={
                process.env.MAPBOX_ACCESS_TOKEN || mapboxToken
              }
              getState={state => selector(state).keplerGl}
              mint={false}
              id="map"
              width={width}
              height={height}
            />
          )}
        </ContainerDimensions>
        <GeoFeatureControl
          geoFeatures={geoFeatures}
          displayGeoFeatures={displayGeoFeatures}
          onUpdateDisplayFeatures={this.props.updateDisplayGeoFeatures}
          visualChannelFeatures={visualChannelFeatures}
          colorByFeature={colorByFeature}
          onUpdateColorByFeature={this.props.updateColorByFeature}
        />
      </Container>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GeoFeatureContainer);
