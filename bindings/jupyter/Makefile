.PHONY: clean build publish-test

clean:
	rm -rf dist

build:
	rm -rf dist
	python setup.py sdist bdist_wheel

publish-test:
	# install the test publish via:
	# pip install --index-url https://test.pypi.org/simple/ mlvis==x.x.x
	twine upload --repository-url https://test.pypi.org/legacy/ dist/*
