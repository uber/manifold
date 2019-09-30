.PHONY: develop install clean build publish publish-test

develop:
	python setup.py develop

install:
	python setup.py install

clean:
	rm -rf dist

build-js:
	cd js && yarn build

build-py:
	rm -rf dist
	python setup.py sdist bdist_wheel

build:
	cd js && yarn build
	rm -rf dist
	python setup.py sdist bdist_wheel
	
publish:
	twine upload dist/*

publish-test:
	# install the test publish via:
	# pip install --index-url https://test.pypi.org/simple/ mlvis==x.x.x
	twine upload --repository-url https://test.pypi.org/legacy/ dist/*
