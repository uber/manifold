# Dynamically build component wrappers utilizing the ipywidget
import os, sys, json, re, importlib
from pkg_resources import resource_string
from ast import literal_eval
from traitlets import Unicode
from .widget import CommonComponent
from .widget_ext import Manifold


extensions = {'Manifold': Manifold}


current_module = sys.modules[__name__]


def load_jrequirements():
    return literal_eval(resource_string('mlvis', 'jrequirements.json').decode('utf8'))


# Extract the Python component wrapper names from the jrequirements
def extract_components(jrequirements):
    return [component for component in jrequirements]


jrequirements = load_jrequirements()
components = extract_components(jrequirements)


def init(self, props={}):
    for parent in self.__class__.__bases__:
        parent.__init__(self, props=props)


# Dynamically create module classes
for component in components:
    deps = (extensions[component], ) if component in extensions else (CommonComponent, )
    setattr(current_module,
            component,
            type(component,
                 deps,
                 {
                     '_model_name': Unicode(component + 'WidgetModel').tag(sync=True),
                     '_view_name': Unicode(component + 'WidgetView').tag(sync=True),
                     '__init__': init
                 }))
