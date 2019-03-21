// @noflow
import React, {PureComponent} from 'react';
import ContainerDimensions from 'react-container-dimensions';
import styled from 'styled-components';
import {connect} from '../custom-connect';

import {updateDivergenceThreshold, exportFeatureEncoder} from '../actions';
import {getDivergenceThreshold} from '../selectors/base';
import {getFeatures} from '../selectors/adaptors';
import FeatureListView from '@uber/feature-list-view';

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
