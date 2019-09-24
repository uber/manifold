import React from 'react';
import ReactDom from 'react-dom';
import {
  BaseComponentWidgetModel,
  BaseComponentWidgetView,
} from './base-component-widget';

export default (Component, name) => {
  const classes = {
    [name + 'WidgetModel']: class extends BaseComponentWidgetModel {},
    [name + 'WidgetView']: class extends BaseComponentWidgetView {
      render = () => {
        super.render(this);
        this._update();
        this.listenTo(this.model, 'change:props', this._update, this);
      };

      _onPropsUpdate = props => {
        const updatedProps = {
          ...props,
          widgetModel: this.model,
          widgetView: this,
        };
        const component = React.createElement(Component, updatedProps);
        ReactDom.render(component, this.el);
      };

      _update = this.getUpdatePropsHandler(this._onPropsUpdate);
    },
  };
  Object.entries(classes).forEach(([name, cls]) => {
    Object.defineProperty(classes[name], 'name', {
      value: name,
      writable: false,
    });
  });
  return classes;
};
