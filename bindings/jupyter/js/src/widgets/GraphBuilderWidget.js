import React from 'react';
import ReactDom from 'react-dom';
import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';
import {GraphBuilder} from '../components';

// TODO: clean up the duplicated code inside these widgets
export class GraphBuilderWidgetModel extends DOMWidgetModel {
  defaults = () => {
    return {
      ...super.defaults(),
    };
  };

  initialize = (...args) => {
    super.initialize(...args);
  };
}

export class GraphBuilderWidgetView extends DOMWidgetView {
  render = () => {
    super.render();
    this._update();
    this.listenTo(this.model, 'change:props', this._update, this);
  };

  _update = () => {
    // TODO: Add input validations for the props.
    const props = JSON.parse(this.model.get('props') || '{}');
    props.widgetModel = this.model;
    props.widgetView = this;
    const component = React.createElement(GraphBuilder, props);
    ReactDom.render(component, this.el);
  };
}
