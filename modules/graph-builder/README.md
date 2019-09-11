# GraphBuilder

A generic node-link diagram

## Usage

Example:
```js
import GraphBuilder from '@uber/graph-builder';

const data = {
  nodes: [
    {id: '1'},
    {id: '2'},
    {id: '3'},
  ],
  edge: [
    {id: 'e1', sourceId: '1', targetId: '2'},
    {id: 'e2', sourceId: '1', targetId: '3'},
    {id: 'e3', sourceId: '2', targetId: '3'},
  ]
};

const App = () => (
  <GraphBuilder
    data={data}
    nodeSize={10}
    nodeColor={'#7743CE'}
    edgeWidth={1}
    edgeColor={'#777777'}
    onNodeClick={n => console.log(n)}
    onEdgeClick={e => console.log(e)}
  />
);
```

<!-- PROPS -->
