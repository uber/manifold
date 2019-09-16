from mlvis.widget import CommonComponent
from traitlets import Unicode


class MultiWayPlot(CommonComponent):
    _model_name = Unicode('MultiWayPlotWidgetModel').tag(sync=True)
    _view_name = Unicode('MultiWayPlotWidgetView').tag(sync=True)
