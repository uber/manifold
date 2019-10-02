import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Icon, Upload} from 'baseui';
import {loadFromLocal} from '../utils/io';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const Component = styled.div`
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

const SidePanel = styled.div`
  background: #f8f8f8;
  border-left: 0.5px dashed #ddd;
  box-shadow: 1px 0px 3px rgba(0, 0, 0, 0.2);
  width: 32px;
  height: 32px;
  padding: 4px;
  svg {
    display: none;
  }
`;

const Placeholder = styled.div`
  width: 320px;
  height: 240px;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
`;

/*
 * This component wraps a given component with a file upload wrapper and
 * injects the uploaded data to the given component
 */
export default class FileUploadWrapper extends PureComponent {
  static defaultProps = {
    children: <Placeholder>Component Placeholder</Placeholder>,
  };

  static propTypes = {
    children: PropTypes.element,
  };

  state = {data: null};

  _handleFileUpload = fileInfo => {
    const {fileList} = fileInfo;
    if (!fileList || !fileList.length) {
      return;
    }
    // TODO currently only use the first file, re-evaluate and consolidate the options:
    // 1. loading single file
    // 2. loading multiple files
    // 3. loading multiple files, zipped
    // 4. figuring out the file => data mapping when multiple files are provided
    const [firstFile] = fileList;
    // TODO surface the loading status with a loading icon
    loadFromLocal([firstFile]).then(payload => {
      this.setState({data: payload});
    });
  };

  render() {
    const {data} = this.state;
    const children = React.Children.map(this.props.children, child => {
      // if data exists, clone and inject to the input child component
      return data ? React.cloneElement(child, {data}) : child;
    });

    return (
      <Container>
        <Component>{children}</Component>
        <SidePanel>
          <Upload
            beforeUpload={() => false}
            onChange={this._handleFileUpload}
            showUploadList={false}
          >
            <Icon style={{fontSize: 20, padding: 2}} type="file-add" />
          </Upload>
        </SidePanel>
      </Container>
    );
  }
}
