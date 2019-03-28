// @noflow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';

import FileUploader from './file-uploader';
import Manifold from 'packages/manifold';
import {loadManifoldData} from './actions';

// NOTE: this only works locally with the alias
// packages/manifold/style.scss => /packages/manifold/src/style.scss
// in production, we probably should change to packages/manifold/dist/style.css
// import 'mapbox-gl/dist/mapbox-gl.css';
import 'packages/manifold/style.scss';

// todo: remove cdn url
// import cdnUrl from 'packages/bedrock/cdn-url';
const cdnUrl = 'fakeUrl';

// urls for sample data
export const SAMPLE_DATA_S3 = {
  REGRESSION: ['/manifold/feature.csv', '/manifold/pred_reg.csv'],
  BIN_CLASSIFICATION: [
    '/manifold/feature.csv',
    '/manifold/pred_bin_0.csv',
    '/manifold/pred_bin_1.csv',
  ],
};

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
    //   loadManifoldData([
    //     '../data/ma_geo_partition.csv',
    //     '../data/ma_geo_nopartition.csv',
    //   ])
    // );
    this._toggleDataUploadModal(true);
  };

  _handleFileChange = fileInfo => {
    this.setState({
      fileList: fileInfo.fileList,
    });
  };

  _handleSampleFileChange = sampleType => {
    this.setState({
      fileList: SAMPLE_DATA_S3[sampleType].map(cdnUrl),
    });
  };

  _handleUpload = () => {
    const {fileList} = this.state;
    if (!fileList || !fileList.length) {
      return;
    }
    this._toggleDataUploadModal(false);
    this.props.dispatch(loadManifoldData(fileList));
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
          handleFileChange={this._handleFileChange}
          handleSampleFileChange={this._handleSampleFileChange}
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
