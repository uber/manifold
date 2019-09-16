from mlvis.widget import CommonComponent
from traitlets import Unicode


class StackedCalendar(CommonComponent):
    _model_name = Unicode('StackedCalendarWidgetModel').tag(sync=True)
    _view_name = Unicode('StackedCalendarWidgetView').tag(sync=True)
