# Graph Builder

## Usage

```python
from mlvis import GraphBuilder
from IPython.display import display

data = {
  "nodes": [
    {"id": '1'},
    {"id": '2'},
    {"id": '3'}
  ],
  "edges": [
    {"id": 'e1', "sourceId": '1', "targetId": '2'},
    {"id": 'e2', "sourceId": '1', "targetId": '3'},
    {"id": 'e3', "sourceId": '2', "targetId": '3'}
  ]
}

graph = GraphBuilder(props={'data': data,
                           "nodeSize": 10,
                            "nodeColor": "#7743CE",
                            "edgeWidth": 1,
                            "edgeColor": "#777777",
                            "height": 500})

display(graph)
```

<img alt="Jupyter" src="https://d1a3f4spazzrp4.cloudfront.net/mlvis/jupyter/docs/graph-builder.png"></img>
