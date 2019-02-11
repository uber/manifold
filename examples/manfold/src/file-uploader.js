// @noflow
import React, {PureComponent} from 'react';
import {Row, Col, Upload, Button, Modal, Icon, Select} from 'antd';

export default class FileUploader extends PureComponent {
  get style() {
    return {
      modalInner: {
        display: 'flex',
        alignItems: 'center',
      },
      choicePanel: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      choicePanelText: {
        padding: '0 0 15px 0',
      },
    };
  }

  render() {
    const {
      showUploadModal,
      toggleUploadModal,
      handleUpload,
      handleFileChange,
      handleSampleFileChange,
    } = this.props;
    return (
      <Modal
        title="Load Data Files"
        visible={showUploadModal}
        onOk={handleUpload}
        onCancel={() => toggleUploadModal(false)}
      >
        <Row style={this.style.modalInner}>
          <Col span={10} style={this.style.choicePanel}>
            <div style={this.style.choicePanelText}>
              Follow the
              <a
                href={
                  'https://engdocs.uberinternal.com/manifold-python/head_get_started.html'
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                instructions{' '}
              </a>
              to prepare <b>one</b> feature file and <b>one or more</b>{' '}
              prediction files.
            </div>
            <Upload
              style={{width: '100%'}}
              accept={'.csv'}
              beforeUpload={() => false}
              onChange={handleFileChange}
              multiple={true}
            >
              <Button>
                <Icon type="upload" /> Select Local Data
              </Button>
            </Upload>
          </Col>

          <Col span={4} style={this.style.choicePanel}>
            {' '}
            OR{' '}
          </Col>
          <Col span={10} style={this.style.choicePanel}>
            <div style={this.style.choicePanelText}>
              No data? Try the data sets from one of the example cases.
            </div>
            <Select
              style={{width: '100%'}}
              placeholder={'Load sample data'}
              onChange={handleSampleFileChange}
            >
              <Select.Option value="REGRESSION">
                {' '}
                Regression example
              </Select.Option>
              <Select.Option value="BIN_CLASSIFICATION">
                Classification example
              </Select.Option>
            </Select>
          </Col>
        </Row>
      </Modal>
    );
  }
}
