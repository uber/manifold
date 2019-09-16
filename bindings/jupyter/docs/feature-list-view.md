# Feature List View

## Usage

```python
import sys, json, math
from mlvis import FeatureListView
from random import uniform, gauss
from IPython.display import display
if sys.version_info[0] < 3:
    import urllib2 as url
else:
    import urllib.request as url

def generate_random_steps(k):
    randoms = [uniform(0, 1) / 2 for i in range(0, k)]
    steps =  [0] * (k - 1)
    t = 0
    for i in range(0, k - 1):
        steps[i] = t + (1 - t) * randoms[i]
        t = steps[i]
    return steps + [1]

def generate_categorical_feature(states):
    size = len(states)
    distro_a = [uniform(0, 1) for i in range(0, size)]
    distro_b = [uniform(0, 1) for i in range(0, size)]
    return {
        'name': 'dummy-categorical-feature',
        'type': 'categorical',
        'domain': list(states.values()),
        'distributions': [distro_a, distro_b],
        'distributionNormalized': [distro_a, distro_b],
        'colors': ['#47B274', '#6F5AA7'],
        'divergence': uniform(0, 1)
    }

def generate_numerical_feature():
    domain_size = 100
    distro_a = [uniform(0, 1) for i in range(0, domain_size)]
    distro_b = [uniform(0, 1) for i in range(0, domain_size)]
    return {
        'name': 'dummy-categorical-numerical',
        'type': 'numerical',
        'domain': generate_random_steps(domain_size),
        'distributions': [distro_a, distro_b],
        'distributionNormalized': [distro_a, distro_b],
        'colors': ['#47B274', '#6F5AA7'],
        'divergence': uniform(0, 1)
    }

def generate_random_categorical_values(states):
    k = 10000
    values = [None] * k
    domain = list(states.values())
    size = len(states)
    for i in range(0, k):
        d = int(math.floor(uniform(0, 1) * size))
        values[i] = domain[d]
    return values

def generate_raw_categorical_feature(states):
    return {
        'name': 'dummy-raw-categorical-feature',
        'type': 'categorical',
        'values': [generate_random_categorical_values(states),
                   generate_random_categorical_values(states)]
    }

def generate_raw_numerical_feature():
    return {
        'name': 'dummy-raw-numerical-feature',
        'type': 'numerical',
        'values': [
            [gauss(2, 0.5) for i in range(0, 2500)],
            [gauss(0, 1) for i in range(0, 7500)]
        ]
    }

# load the US states data
PREFIX = 'https://d1a3f4spazzrp4.cloudfront.net/mlvis/'
response = url.urlopen(PREFIX + 'jupyter/states.json')
states = json.loads(response.read().decode())

# Randomly generate the data for the feature list view
categorical_feature = generate_categorical_feature(states)
raw_categorical_feature = generate_raw_categorical_feature(states)
numerical_feature = generate_numerical_feature()
raw_numerical_feature = generate_raw_numerical_feature()
data = [categorical_feature, raw_categorical_feature, numerical_feature, raw_numerical_feature]

feature_list_view = FeatureListView(props={"data": data, "width": 1000})

display(feature_list_view)
```

<img alt="Jupyter" src="https://d1a3f4spazzrp4.cloudfront.net/mlvis/jupyter/docs/feature-list-view.png"></img>
