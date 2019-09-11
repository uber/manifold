# Dynamically build component wrappers utilizing the ipywidget
import os, sys, json, re, importlib
from traitlets import Unicode
from .widget import CommonComponent
from .widget_ext import Manifold, GraphBuilder, StackedCalendar, FeatureListView, MultiWayPlot


components = [
  'FeatureListView',
  'GraphBuilder',
  'Manifold',
  'MultiWayPlot',
  'StackedCalendar'
]


extensions = {
    'Manifold': Manifold,
    'StackedCalendar': StackedCalendar,
    'GraphBuilder': GraphBuilder,
    'MultiWayPlot': MultiWayPlot,
    'FeatureListView': FeatureListView
    }


current_module = sys.modules[__name__]

# TODO: Temporary comment out these code for v1 cut

# def load_jrequirements():
#     try:
#         file = open(os.path.join(BASE_DIR, 'jrequirements.json'), mode='r')
#         return json.load(file)
#     finally:
#         if file:
#             file.close()
#
#
# # Extract the Python component wrapper names from the jrequirements
# def extract_components(jrequirements):
#     return [component for component in jrequirements]
#
#
# # Dynamically load Python extension code for the wrapper
# def load_extension(name):
#     importlib.invalidate_caches()
#     module = importlib.import_module('mlvis.widget_ext.' + name)
#     return getattr(module, name)
#
#
# # Load all available Python extension code
# def load_prebuilt_extensions(jrequirements):
#     exts = dict()
#     for subdir, dirs, files in os.walk(os.path.join(BASE_DIR, 'mlvis', 'widget_ext')):
#         for file in files:
#             name = re.sub(r'\.py', '', file)
#             if name in jrequirements:
#                 exts[name] = load_extension(name)
#     return exts
#
#
# jrequirements = load_jrequirements()
#
#
# components = extract_components(jrequirements)
#
#
# extensions = load_prebuilt_extensions(jrequirements)

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
                     '__init__': init
                 }))
