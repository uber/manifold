import React from 'react';
import PropTypes from 'prop-types';
import GraphGL, {D3ForceLayout, JSONLoader, NODE_TYPE} from '@uber/graph.gl';

const Identity = n => n;

class GraphBuilder extends React.Component {
  static propTypes = {
    /** input data, please check the expected data schema in the readme */
    data: PropTypes.object.isRequired,
    /** the size of the node */
    nodeSize: PropTypes.number,
    /** the color of the node. ex: '#00ff00'. */
    nodeColor: PropTypes.string,
    /** the thickness of the edge */
    edgeWidth: PropTypes.number,
    /** the color of the edge. ex: '#ff0000' */
    edgeColor: PropTypes.string,
    /** callback when a node is clicked */
    onNodeClick: PropTypes.func,
    /** callback when an edge is clicked */
    onEdgeClick: PropTypes.func,
  };

  static defaultProps = {
    nodeSize: 10,
    nodeColor: '#7743CE',
    edgeWidth: 1,
    edgeColor: '#777',
    onNodeClick: () => {},
    onEdgeClick: () => {},
  };

  state = {graph: null};

  static getDerivedStateFromProps(nextProps) {
    // TODO: generate new data state only data is change
    const graph = JSONLoader({
      json: nextProps.data,
      nodeParser: Identity,
      edgeParser: Identity,
    });
    return {
      graph,
    };
  }

  render() {
    if (!this.state.graph) {
      return null;
    }
    return (
      <div
        style={{
          background: '#fff',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <GraphGL
          graph={this.state.graph}
          layout={new D3ForceLayout()}
          nodeEvents={{
            onClick: this.props.onNodeClick,
          }}
          nodeStyle={[
            {
              type: NODE_TYPE.MARKER,
              size: this.props.nodeSize,
              fill: this.props.nodeColor,
              marker: 'circle-filled',

              ':hover': {
                fill: 'orange',
              },
            },
            {
              type: NODE_TYPE.LABEL,
              text: node => String(node.id).substring(0, 6),
              color: 'black',
              fontSize: 15,
              offset: [0, 12],
              scaleWithZoom: true,

              ':hover': {
                text: 'hover',
                color: 'white',
              },
            },
          ]}
          enableDragging
          edgeEvents={{
            onClick: this.props.onEdgeClick,
          }}
          edgeStyle={{
            stroke: this.props.edgeColor,
            strokeWidth: this.props.edgeWidth,
          }}
        />
      </div>
    );
  }
}

export default GraphBuilder;
