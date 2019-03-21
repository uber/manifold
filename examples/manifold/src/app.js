// @noflow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';

import FileUploader from './file-uploader';
import Manifold from '@uber/manifold';
import {loadManifoldData} from './actions';

// NOTE: this only works locally with the alias
// @uber/manifold/style.scss => /packages/manifold/src/style.scss
// in production, we probably should change to @uber/manifold/dist/style.css
import '@uber/manifold/style.scss';

// todo: remove cdn url
// import cdnUrl from '@uber/bedrock/cdn-url';
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
  height: calc(100vh + 100px);
  padding: 50px 80px 50px;
  background: #eee;
`;

class App extends Component {
  state = {
    showUploadModal: false,
    fileList: [],
  };

  componentDidMount = () => {
    // this.props.dispatch(loadLocalData(['../data/ma_reg_1_0.csv']));
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
