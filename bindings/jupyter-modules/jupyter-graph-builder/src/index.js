import React from 'react';
import GraphBuilder from '@mlvis/graph-builder';

export default props => (
  <div style={{position: 'relative', height: 500}}>
    <GraphBuilder {...props} />
  </div>
);
