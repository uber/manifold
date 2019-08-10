from setuptools import setup, find_packages

INSTALL_REQUIRES = [
    'traitlets',
    'ipywidgets'
]

setup(name='jupyter_utils',
      version='0.0.1',
      description='Jupyter utils',
      url='https://github.com/manifold/src/jupyter-utils',
      author='Hong Wang',
      author_email='hongw@uber.com',
      license='MIT',
      packages=find_packages(),
      zip_safe=False,
      install_requires=INSTALL_REQUIRES
      )
