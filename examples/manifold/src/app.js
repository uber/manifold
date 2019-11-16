import React, {Component} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import ContainerDimensions from 'react-container-dimensions';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';

import FileUploader from './file-uploader';
import Manifold from '@mlvis/manifold';
// todo: temp
import {loadUserData} from '@mlvis/manifold/actions';
// import {FEATURE_TYPE} from '@mlvis/mlvis-common/constants';
// import {loadMAData} from './actions';

const getManifoldState = state => state.demo.manifold;

const Container = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  background: #eee;
`;

const engine = new Styletron();

class App extends Component {
  state = {
    showUploadModal: false,
    fileList: [],
  };

  componentDidMount = () => {
    // this.props.dispatch(
    //   loadMAData([
    //     '../data/ma_geo_partition.csv',
    //     '../data/ma_geo_nopartition.csv',
    //   ])
    // );
    // setTimeout(
    //   () =>
    //     this.props.dispatch(
    //       updateFeatureTypes({
    //         [FEATURE_TYPE.GEO]: [
    //           ['@derived:requestedbegin_lng', '@derived:requestedbegin_lat'],
    //           ['@derived:requestedend_lng', '@derived:requestedend_lat'],
    //         ],
    //       })
    //     ),
    //   0
    // );
    this._toggleDataUploadModal(true);
  };

  _handleUpload = userData => {
    this._toggleDataUploadModal(false);
    this.props.dispatch(loadUserData(userData));
  };

  _toggleDataUploadModal = show => {
    this.setState({showUploadModal: show});
  };

  render() {
    const {showUploadModal} = this.state;
    return (
      <StyletronProvider value={engine}>
        <Container>
          <ContainerDimensions>
            {({width, height}) => (
              <Manifold
                // Specify path to Manifold state, because it is not mount at the root
                getState={getManifoldState}
                width={width}
                height={height}
              />
            )}
          </ContainerDimensions>
          <FileUploader
            showUploadModal={showUploadModal}
            toggleUploadModal={this._toggleDataUploadModal}
            handleUpload={this._handleUpload}
          />
        </Container>
      </StyletronProvider>
    );
  }
}

// if (process.env.NODE_ENV !== 'production') {
//   const {whyDidYouUpdate} = require('why-did-you-update');
//   whyDidYouUpdate(React, {include: [/Manifold/, /Container/]});
// }

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(
  mapStateToProps,
  dispatchToProps
)(App);
