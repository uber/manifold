# Development

#### Javascript

Build the JS code

```
cd js
yarn
yarn build
```

#### Python

It is recommended to first start a virtual environment in the project folder:

```
python -m venv venv
source venv/bin/activate
```

First install ipywidgets

<!-- todo: ipywidgets should be installed together with `python setup.py install`-->

```
pip install ipywidgets
jupyter nbextension enable --py widgetsnbextension
```

To run the code directly under this directory, the Jupyter nbextension needs to be installed in this local environment:

```
python setup.py install
```

If running `python setup.py install` for the first time, the following two commands need to be executed (these should only need to be executed once).

```
jupyter nbextension install --py --symlink --sys-prefix mlvis
jupyter nbextension enable --py --sys-prefix mlvis
```

#### Run

Start the Jupyter Notebook directly under this directory:

```
jupyter notebook
```

#### Build

To build the package into the example directly, please use the following command:

```
python setup.py sdist bdist_wheel
mv dist ../../examples/jupyter/
```

To test the built package in the example folder, go to _mlvis-toolkit/examples/jupyter_, and perform the following stepts:

1. start a virtual environment
2. run `pip install -r requirements.txt`
3. run `pip install ./dist/mlvis-[version].tar.gz`
4. execute `jupyter notebook` there.
