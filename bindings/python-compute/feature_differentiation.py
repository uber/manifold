import pandas as pd
import numpy as np
from scipy.stats.kde import gaussian_kde
from scipy.stats import entropy
from numpy.linalg import LinAlgError

from .data_manager import DUMMY_PREFIX_SEP
from .constants import RANGE_FILTER

CLUSTER_COL = 'clusters'
GROUP_ID_COL = 'clusterGroupId'
NUMERICAL_DOMAIN_INTERVAL = 100
# index of nearest element in array to value
nearest_index = lambda arr, val: (np.abs(arr - val)).argmin()
# get a distribution where all densities are 0 except for the position of unique value (=1)
def get_single_value_distribution(domain, raw_values):
    unique_value = raw_values.unique()[0]
    distribution = np.zeros(domain.shape)
    distribution[nearest_index(domain, unique_value)] = 1.
    return distribution


class FeatureDifferentiation(object):

    def __init__(self, feature_df, categorical_features=None):
        self.feature_df = feature_df.copy()
        self.categorical_features = categorical_features
        self.cat_dict = self.compute_categorical_features_dict()
        self.features_meta_data = self.compute_features_meta_data()


    def set_params(self, segment_group_0, segment_group_1, segment_ids):
        self.target = pd.Series([0 if i in segment_group_0 else (1 if i in segment_group_1 else 2)
                                 for i in segment_ids])


    def compute_categorical_features_dict(self):
        if self.categorical_features is None:
            # if data type is non-number or has small number of unique values
            self.categorical_features = [c for c in self.feature_df.columns
                            if len(self.feature_df[c].unique()) < 7 or self.feature_df.dtypes[c] == 'object']
        cat_dict = {}
        # create a dict of list, dict fields are categorical parent features,
        # and list elements are parent feature names suffixed with category names
        for c in self.categorical_features:
            # in case of features are already one-hot encoded
            c_split = c.split(DUMMY_PREFIX_SEP)
            try:
                cat_dict[c_split[0]]
            except:
                cat_dict[c_split[0]] = []
            cat_dict[c_split[0]] += [c]
        return cat_dict


    # todo: merge histogram computation in compute_features_meta_data, compute_split_cat_count, compute_split_kde
    def compute_features_meta_data(self):
        features_list = []
        for feature_name in self.feature_df.columns:
            col = self.feature_df[feature_name]

            if feature_name in self.cat_dict:
                type = 'categorical'
                value_counts = col.value_counts(dropna=False)
                distribution = np.stack([value_counts.index.values, value_counts.values]).tolist()
            else:
                x = np.linspace(np.min(col), np.max(col), num=NUMERICAL_DOMAIN_INTERVAL)
                try:
                    kde = gaussian_kde(col, bw_method=0.1)
                except LinAlgError:
                    kde = lambda x: get_single_value_distribution(x, col)
                distribution = np.stack([x, 10000*kde(x)]).tolist()

            if len(distribution[0]) <= 1 or \
                len(distribution[0]) > max(len(col) / 10., 100):
                continue

            feature_dict = {
                'name': feature_name,
                'type': 'categorical' if feature_name in self.cat_dict else 'numerical',
                'distribution': distribution
            }
            features_list.append(feature_dict)
        return features_list


    def compute_split_cat_count(self, col, exclude_outlier=False):
        if exclude_outlier:
            cc = col.value_counts()
            mask = col.isin(cc.index[cc < len(col) * .005])
            col.loc[mask] = 'OTHER_CATEGORY'

        cc0 = col[self.target == 0].value_counts(normalize=True, dropna=False)
        cc1 = col[self.target == 1].value_counts(normalize=True, dropna=False)

        count_df = pd.concat([cc0, cc1], axis=1).fillna(0)
        count_df.columns = [0, 1]
        count_df.index = count_df.index.fillna('NO_CATEGORY')

        buffer = 1. / float(len(self.target))
        count_df['ratio'] = count_df.apply(lambda row: (row[0] + buffer) / (row[1] + buffer), axis=1)
        count_df.sort_values('ratio', inplace=True)

        return np.stack((count_df.index.values, 10000*count_df[0].values, 10000*count_df[1].values))


    def compute_split_kde(self, col, exclude_outlier=True):
        try:
            col_value_range = RANGE_FILTER[col.name]
        except:
            if exclude_outlier:
                col_value_range = [np.percentile(col, 1), np.percentile(col, 99)]
            else:
                col_value_range = [np.min(col), np.max(col)]

        x = np.linspace(col_value_range[0], col_value_range[1], num=NUMERICAL_DOMAIN_INTERVAL)
        # could also use pd.Series.value_counts, (use bins)
        # if unique values in array <=1, kde will have exception
        try:
            kde0 = gaussian_kde(col[self.target == 0], bw_method=0.1)
        except LinAlgError:
            kde0 = lambda x: get_single_value_distribution(x, col[self.target == 0])
        try:
            kde1 = gaussian_kde(col[self.target == 1], bw_method=0.1)
        except LinAlgError:
            kde1 = lambda x: get_single_value_distribution(x, col[self.target == 1])

        return np.stack((x, 10000*kde0(x), 10000*kde1(x)))


    def get_features_meta_data(self):
        return self.features_meta_data


    def get_feature_distribution_by_segment_group(self, feature_name):
        distribution_dict = {}
        main_name = feature_name.split(DUMMY_PREFIX_SEP)[0]
        distribution_dict['name'] = main_name
        if main_name in self.cat_dict:
            distribution_dict['distribution'] = self.compute_split_cat_count(self.feature_df[main_name]).tolist()
            distribution_dict['type'] = 'categorical'
        else:
            distribution_dict['distribution'] = self.compute_split_kde(self.feature_df[main_name]).tolist()
            distribution_dict['type'] = 'numerical'
        return distribution_dict


    def get_features_distribution_by_segment_group(self):
        distribution_list = []
        buffer = 1. / float(len(self.target))

        for feature_name in self.feature_df.columns:
            distribution_dict = self.get_feature_distribution_by_segment_group(feature_name)

            # ignore features with too may categories, like uuid; ignore features with only one category
            if len(distribution_dict['distribution'][0]) <= 1 or \
                len(distribution_dict['distribution'][0]) > max(len(self.target) / 10., 100):
                continue

            distribution_dict['divergence'] =  entropy(
                np.array(distribution_dict['distribution'][1]) + buffer,
                np.array(distribution_dict['distribution'][2]) + buffer
            )
            distribution_list.append(distribution_dict)
        return sorted(distribution_list, key=lambda x: x['divergence'], reverse=True)
