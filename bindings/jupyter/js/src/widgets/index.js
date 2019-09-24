const widgetBuilder = require('./react-widget-builder').default;

for (const name of [
  'StackedCalendar',
  'GraphBuilder',
  'FeatureListView',
  'MultiWayPlot',
  'Manifold',
]) {
  const Component = require('../components')[name];
  const widgets = widgetBuilder(Component, name);

  module.exports[name + 'WidgetView'] = widgets[name + 'WidgetView'];
  module.exports[name + 'WidgetModel'] = widgets[name + 'WidgetModel'];
}
