import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

export class BaseComponentWidgetModel extends DOMWidgetModel {}

export class BaseComponentWidgetView extends DOMWidgetView {
  render = () => {
    super.render();
    this._update();
    this.listenTo(this.model, 'change:props', this._update(), this);
  };

  getUpdatePropsHandler = callback => () => {
    const props = JSON.parse(this.model.get('props') || '{}');
    callback && callback(props);
  };

  _update = this.getUpdatePropsHandler();
}
