// @noflow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';

import FileUploader from './file-uploader';
import Manifold from 'packages/manifold';
// todo: temp
// import {updateFeatureTypes} from 'packages/manifold/actions';
// import {FEATURE_TYPE} from 'packages/mlvis-common/constants';
import {loadUserData} from './actions';

// NOTE: this only works locally with the alias
// packages/manifold/style.scss => /packages/manifold/src/style.scss
// in production, we probably should change to packages/manifold/dist/style.css
import 'packages/manifold/style.scss';
// import 'mapbox-gl/dist/mapbox-gl.css';

const Container = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  background: #eee;
`;

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
      <Container>
        <Manifold
          // Specify path to Manifold state, because it is not mount at the root
          getState={state => state.demo.manifold}
        />
        <FileUploader
          showUploadModal={showUploadModal}
          toggleUploadModal={this._toggleDataUploadModal}
          handleUpload={this._handleUpload}
        />
      </Container>
    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(
  mapStateToProps,
  dispatchToProps
)(App);
