// @noflow
import React from 'react';
import styled from 'styled-components';

import File from './file';

const FileNameTag = styled.div`
  background-color: currentColor;
  border-radius: 1px;
  display: inline-block;
  padding: 0 4px;
  position: absolute;
  top: 45%;
  left: 10%;

  .text {
    color: white;
    font-size: ${props => props.fontSize};
  },
`;

const FileTypeIconWrapper = styled.div`
  display: inline-block;
  position: relative;
  color: currentColor;
  height: ${props => props.height};
`;

const FileTypeIcon = ({ext, height, fontSize}) => (
  <FileTypeIconWrapper height={height}>
    <File height={height} />
    <FileNameTag fontSize={fontSize}>
      <div className="text">{ext}</div>
    </FileNameTag>
  </FileTypeIconWrapper>
);

export default FileTypeIcon;
