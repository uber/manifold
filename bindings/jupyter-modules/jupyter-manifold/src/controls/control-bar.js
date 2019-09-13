import React from 'react';
import SegmentExportButton from './segment-export-button';
const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: 50,
  width: '100%',
  padding: '5px 5px',
  backgroundColor: '#f5f5f5',
};

export default props => (
  <div style={style}>
    <SegmentExportButton {...props} />
  </div>
);
