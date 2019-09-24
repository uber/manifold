const Jupyter = require('base/js/namespace');
const widgetBuilder = require('./react-widget-builder').default;
const req = require('../../../jrequirements.json');

// Specify the widget customization of the corresponding components,
// Currently it only specifies the renderCallback function.
// TODO: Move these to jrequirements.json
const reqExt = {
  Manifold: function() {
    this.listenTo(
      this.model,
      'change:segments',
      () => {
        const segments = this.model.get('segments');
        if (segments) {
          const msgId = Jupyter.notebook.kernel.last_msg_id;
          const cell = Jupyter.notebook.get_msg_cell(msgId);
          const cellIndex = Jupyter.notebook.find_cell_index(cell);
          const newCell = Jupyter.notebook.insert_cell_below('code', cellIndex);
          newCell.set_text(`segments = ${segments}`);
          newCell.execute();
        }
      },
      this
    );
    this.options.output.wrapper.css({'z-index': 2});
  },
};

// TODO: Implement dynamic import of components
for (const name of Object.keys(req)) {
  const Component = require('../components')[name];
  const callback = reqExt[name] || function() {};
  const widgets = widgetBuilder(Component, name, callback);

  module.exports[name + 'WidgetView'] = widgets[name + 'WidgetView'];
  module.exports[name + 'WidgetModel'] = widgets[name + 'WidgetModel'];
}
