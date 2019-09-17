# Introduction

<img alt="Jupyter" src="https://d1a3f4spazzrp4.cloudfront.net/mlvis/jupyter/docs/demo.gif"></img>

The mlvis library contains a suite a visualization components. This library is still under active development. The current version consists of several prebuilt visualization components:

- [Stacked Calendar](https://github.com/uber/manifold/tree/master/bindings/jupyter/docs/stacked-calendar.md)
- [Graph Builder](https://github.com/uber/manifold/tree/master/bindings/jupyter/docs/graph-builder.md)
- [Manifold](https://github.com/uber/manifold/tree/master/bindings/jupyter/docs/manifold.md)
- [Feature List View](https://github.com/uber/manifold/tree/master/bindings/jupyter/docs/feature-list-view.md)

## Installation

```
pip install mlvis
```

Then install the nbextension into the Jupyter notebook

```
jupyter nbextension install --py --symlink --sys-prefix mlvis
jupyter nbextension enable --py --sys-prefix mlvis
```

## Development

Instructions for building this project locally can be found in the [development documentation](https://github.com/uber/manifold/tree/master/bindings/jupyter/docs/development.md).
