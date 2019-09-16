from mlvis.widget import CommonComponent
from traitlets import Unicode


class GraphBuilder(CommonComponent):
    _model_name = Unicode('GraphBuilderWidgetModel').tag(sync=True)
    _view_name = Unicode('GraphBuilderWidgetView').tag(sync=True)
