from setuptools import setup, find_packages, Command
from setuptools.command.develop import develop as _develop
from setuptools.command.install import install as _install
import os, subprocess, json


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


EXTENSION_DIR = os.path.join(os.path.dirname(__file__), "mlvis", "static")


INSTALL_REQUIRES = [
    'traitlets',
    'ipywidgets',
    'pandas'
]


DEFAULT_JREQUIREMENTS = {
    "FeatureListView": {
        "module": {"@mlvis/feature-list-view": "external"}
    },
    "GraphBuilder": {
        "module": {"@mlvis/jupyter-graph-builder": "external"}
    },
    "Manifold": {
        "module": {"@mlvis/juypter-manifold": "external"}
    },
    "MultiWayPlot": {
        "module": {"@mlvis/jupyter-multi-way-plot": "external"}
    },
    "StackedCalendar": {
        "module": {"@mlvis/stacked-calendar": "external"}
    },
    "MACausal": {
        "module": {"@mlvis/jupyter-ma-causal": "external"}
    },
    "NotebookSearch": {
        "module": {"@mlvis/jupyter-notebook-search": "external"}
    }
}


def read(*parts):
    return open(os.path.join(BASE_DIR, *parts), 'r').read()


def init_jrequirements():
    try:
        file = open(os.path.join(BASE_DIR, 'mlvis', 'jrequirements.json'), mode='w')
        json.dump(DEFAULT_JREQUIREMENTS, file, indent=2)
    finally:
        if file:
            file.close()


class init_jrequirements_command(Command):
    description = 'customize jrequirements.json'
    user_options = []

    def initialize_options(self): pass
    def finalize_options(self): pass

    def run(self):
        init_jrequirements()


class develop(_develop):
    def run(self):
        from notebook.nbextensions import install_nbextension
        from notebook.services.config import ConfigManager

        _develop.run(self)

        install_nbextension(EXTENSION_DIR, symlink=True,
                            overwrite=True, user=False, destination="mlvis")
        cm = ConfigManager()
        cm.update('notebook', {"load_extensions":
            {
                "mlvis/index": True,
                "mlvis/extension": True
            }
        })


class install(_install):
    def run(self):
        _install.run(self)

        # A hack for installing the install_requires as there seems to be
        # a issue with custom install command:
        # https://github.com/pypa/setuptools/issues/456
        subprocess.check_call(['pip', 'install'] + INSTALL_REQUIRES)


setup(name='mlvis',
      cmdclass={'develop': develop,
                'init_jrequirements': init_jrequirements_command},
      version='0.1.0',
      description='A wrapper around react components for use in jupyter notebooks',
      long_description='{}'.format(read(os.path.join('docs', 'introduction.md'))),
      long_description_content_type='text/markdown',
      keywords=['data', 'visualization', 'machine learning'],
      url='https://github.com/uber/manifold.git',
      author='Hong Wang',
      author_email='hongw@uber.com',
      license='Apache License 2.0',
      include_package_data=True,
      packages=find_packages(),
      zip_safe=False,
      package_data={'': ['mlvis/jrequirements.json']},
      data_files=[
        ('share/jupyter/nbextensions/mlvis', [
            'mlvis/static/extension.js',
            'mlvis/static/index.js',
            'mlvis/static/index.js.map'
        ])
      ],
      scripts=['bin/jpip'],
      install_requires=INSTALL_REQUIRES,
      classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'Topic :: Multimedia :: Graphics',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Framework :: Jupyter'
        ]
      )
