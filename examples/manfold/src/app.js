// @noflow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import window from 'global/window';

import {loadLocalData} from './actions';
import FileUploader from './file-uploader';
import Manifold from '@uber/manifold';

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

class App extends Component {
  state = {
    showUploadModal: false,
    fileList: [],
    width: window.innerWidth,
    height: window.innerHeight,
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
    this.props.dispatch(loadLocalData(fileList));
  };

  _toggleDataUploadModal = show => {
    this.setState({showUploadModal: show});
  };

  render() {
    const {dispatch} = this.props;
    const {width, height, showUploadModal} = this.state;
    return (
      <div style={{position: 'absolute', width: '100%', height: '100%'}}>
        <Manifold
          /*
           * Specify path to Manifold state, because it is not mount at the root
           */
          getState={state => state.demo.manifold}
          dispatch={dispatch}
          width={width}
          height={height}
        />
        <FileUploader
          showUploadModal={showUploadModal}
          toggleUploadModal={this._toggleDataUploadModal}
          handleUpload={this._handleUpload}
          handleFileChange={this._handleFileChange}
          handleSampleFileChange={this._handleSampleFileChange}
        />
      </div>
    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(
  mapStateToProps,
  dispatchToProps
)(App);
