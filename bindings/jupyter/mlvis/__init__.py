from .widget_builder import *


def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'mlvis',
        'require': 'mlvis/extension'
    }]
