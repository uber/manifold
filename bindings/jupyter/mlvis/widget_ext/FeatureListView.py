from mlvis.widget import CommonComponent
from traitlets import Unicode


class FeatureListView(CommonComponent):
    _model_name = Unicode('FeatureListViewWidgetModel').tag(sync=True)
    _view_name = Unicode('FeatureListViewWidgetView').tag(sync=True)
