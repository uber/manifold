// @noflow
import React, {PureComponent} from 'react';
import {Upload, Modal, Icon, Select} from 'antd';
import styled from 'styled-components';
import {DATASET, SAMPLE_DATA_S3, convertToCdnUrl} from './constants';
import {isDatasetIncomplete} from './utils';

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const CustomDataSection = styled.div`
  margin-bottom: 20px;
`;

const UploadButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
`;

const UploadButton = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  max-width: 150px;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  :hover {
    border: 1px dashed #1890ff;
  }
`;

export default class FileUploader extends PureComponent {
  get style() {
    return {
      modal: {
        width: '400px',
      },
      choicePanel: {
        display: 'flex',
        alignItems: 'center',
      },
      uploadButtons: {
        display: 'flex',
        alignItems: 'center',
      },
    };
  }

  state = {
    x: undefined,
    yPred: [],
    yTrue: undefined,
  };

  _handleFileChange = (fileInfo, key) => {
    // yPred could accept mulpiple files, other fields cannot
    const file = key === 'yPred' ? fileInfo.fileList : fileInfo.fileList[0];
    this.setState({
      [key]: file,
    });
  };

  _handleSampleFileChange = sampleType => {
    const dataset = SAMPLE_DATA_S3[sampleType];
    const {x, yPred, yTrue} = dataset;
    this.setState({
      x: convertToCdnUrl(x),
      yPred: yPred.map(convertToCdnUrl),
      yTrue: convertToCdnUrl(yTrue),
    });
  };

  _handleUpload = () => {
    const {handleUpload} = this.props;
    const {x, yPred, yTrue} = this.state;
    if (isDatasetIncomplete({x, yPred, yTrue})) {
      this.setState({
        isDatasetIncomplete: true,
      });
    } else {
      handleUpload({x, yPred, yTrue});
    }
  };

  render() {
    const {showUploadModal, toggleUploadModal} = this.props;
    return (
      <Modal
        width={600}
        title="Load Data Files"
        visible={showUploadModal}
        onOk={this._handleUpload}
        onCancel={() => toggleUploadModal(false)}
      >
        <Content>
          <CustomDataSection>
            <div>
              Follow the
              <a
                href={'https://github.com/uber/manifold#prepare-your-data'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {' instructions '}
              </a>
              to prepare <b>one</b> feature file and <b>one or more</b>{' '}
              prediction files.
            </div>
            <UploadButtons>
              <Upload
                accept={'.csv'}
                beforeUpload={() => false}
                onChange={fileInfo => this._handleFileChange(fileInfo, 'x')}
              >
                <UploadButton>
                  <Icon type="upload" /> Select Feature Data Set
                </UploadButton>
              </Upload>
              <Upload
                accept={'.csv'}
                beforeUpload={() => false}
                onChange={fileInfo => this._handleFileChange(fileInfo, 'yPred')}
                multiple={true}
              >
                <UploadButton>
                  <Icon type="upload" /> Select Prediction Data Set(s)
                </UploadButton>
              </Upload>
              <Upload
                accept={'.csv'}
                beforeUpload={() => false}
                onChange={fileInfo => this._handleFileChange(fileInfo, 'yTrue')}
              >
                <UploadButton>
                  <Icon type="upload" /> Select Ground Truth Data Set
                </UploadButton>
              </Upload>
            </UploadButtons>
          </CustomDataSection>

          <CustomDataSection>
            <div style={this.style.choicePanelText}>
              No data? Try the data sets from one of the example cases.
            </div>
            <Select
              style={{width: '100%'}}
              placeholder={'Load sample data'}
              onChange={this._handleSampleFileChange}
            >
              <Select.Option value={DATASET.REG}>
                Regression example
              </Select.Option>
              {/* todo: add binary classification data to S3
              <Select.Option value={DATASET.BIN}>
                Classification example
              </Select.Option> */}
            </Select>
          </CustomDataSection>
        </Content>
      </Modal>
    );
  }
}
