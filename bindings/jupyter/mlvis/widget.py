from __future__ import unicode_literals

import json
import ipywidgets as widgets
from traitlets import Unicode

MODULE_NAME = 'mlviswidget'
VERSION = '0.0.1'

class Widget(widgets.DOMWidget):
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_name = Unicode('WidgetModel').tag(sync=True)
    _model_module_version = Unicode(VERSION).tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_name = Unicode('WidgetView').tag(sync=True)
    _view_module_version = Unicode(VERSION).tag(sync=True)
    props = Unicode('{}').tag(sync=True)


class CommonComponent(Widget):
    def __init__(self, props={}, **kwargs):
        super(CommonComponent, self).__init__()
        # TODO: make explicit exception message for the json input is invalid
        self.props = json.dumps(props)
