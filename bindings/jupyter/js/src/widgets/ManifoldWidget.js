import React from 'react';
import ReactDom from 'react-dom';
import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';
import {Manifold} from '../components';
import Jupyter from 'base/js/namespace';

// TODO: clean up the duplicated code inside these widgets
export class ManifoldWidgetModel extends DOMWidgetModel {
  defaults = () => {
    return {
      ...super.defaults(),
    };
  };

  initialize = (...args) => {
    super.initialize(...args);
  };
}

export class ManifoldWidgetView extends DOMWidgetView {
  render = () => {
    super.render();
    this._update();
    this.listenTo(this.model, 'change:props', this._update, this);
    this.listenTo(this.model, 'change:segments', this._updateFeedback, this);
    this.options.output.wrapper.css({'z-index': 2});
  };

  _updateFeedback = () => {
    const segments = this.model.get('segments');
    if (segments) {
      const msgId = Jupyter.notebook.kernel.last_msg_id;
      const cell = Jupyter.notebook.get_msg_cell(msgId);
      const cellIndex = Jupyter.notebook.find_cell_index(cell);
      const newCell = Jupyter.notebook.insert_cell_below('code', cellIndex);
      newCell.set_text(`segments = ${segments}`);
      newCell.execute();
    }
  };

  _update = () => {
    // TODO: Add input validations for the props.
    const props = JSON.parse(this.model.get('props') || '{}');
    props.widgetModel = this.model;
    props.widgetView = this;
    const component = React.createElement(Manifold, props);
    ReactDom.render(component, this.el);
  };
}
