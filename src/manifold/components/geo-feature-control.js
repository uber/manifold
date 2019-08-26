import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {StyledControl, StyledSelect, SelectArrow} from './styled-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  padding: 20px;
`;

export default class GeoFeatureControl extends PureComponent {
  static propTypes = {
    geoFeatures: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
      })
    ),
    displayGeoFeatures: PropTypes.arrayOf(PropTypes.number),
    onUpdateDisplayFeatures: PropTypes.func,
  };
  static defaultProps = {
    geoFeatures: [],
    displayGeoFeatures: [0],
    onUpdateDisplayFeatures: () => {},
  };

  _onUpdateDisplayFeatures = e => {
    this.props.onUpdateDisplayFeatures(Number(e.target.value));
  };

  _onUpdateColorByFeature = e => {
    this.props.onUpdateColorByFeature(Number(e.target.value));
  };

  render() {
    const {
      geoFeatures,
      displayGeoFeatures,
      visualChannelFeatures,
      colorByFeature,
    } = this.props;
    return (
      <Container>
        <StyledControl name="Showing:">
          <StyledSelect>
            <select
              value={displayGeoFeatures[0]}
              onChange={this._onUpdateDisplayFeatures}
            >
              {geoFeatures.map((feature, i) => (
                <option value={i} key={i}>
                  {feature.name}
                </option>
              ))}
            </select>
            <SelectArrow height="16" />
          </StyledSelect>
        </StyledControl>

        <StyledControl name="Color by:">
          <StyledSelect>
            <select
              value={colorByFeature}
              onChange={this._onUpdateColorByFeature}
            >
              {visualChannelFeatures.map((feature, i) => (
                <option value={i} key={i}>
                  {feature.name}
                </option>
              ))}
            </select>
            <SelectArrow height="16" />
          </StyledSelect>
        </StyledControl>
      </Container>
    );
  }
}
