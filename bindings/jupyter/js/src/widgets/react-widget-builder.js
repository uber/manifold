import React from 'react';
import ReactDom from 'react-dom';
import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

export default (Component, name, renderCallback = function() {}) => {
  const classes = {
    [name + 'WidgetModel']: class extends DOMWidgetModel {},
    [name + 'WidgetView']: class extends DOMWidgetView {
      render = () => {
        super.render(this);
        this._update();
        this.listenTo(this.model, 'change:props', this._update, this);
        renderCallback.apply(this);
      };

      _update = () => {
        const props = JSON.parse(this.model.get('props') || '{}');
        props.widgetModel = this.model;
        props.widgetView = this.view;
        const component = React.createElement(Component, props);
        ReactDom.render(component, this.el);
      };
    },
  };
  Object.entries(classes).forEach(([name, cls]) => {
    Object.defineProperty(cls, 'name', {
      value: name,
      writable: false,
    });
  });
  return classes;
};
