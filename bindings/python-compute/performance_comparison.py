import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering, KMeans
from scipy.stats.kde import gaussian_kde
from .utils import compute_filter


percentile_list = [1, 10, 25, 50, 75, 90, 99]
percentiles_func = lambda x: [np.percentile(x, p) for p in percentile_list]


def density_func(col):
    x = np.linspace(np.min(col), np.max(col), num=100)
    kde = gaussian_kde(col)
    return [x.tolist(), kde(x).tolist()]


# get a list of prediction probability columns which are independent with each other
# possible columns are in "modelClass_<modelId>_<classId>" form
# for predictions of N1 number of models on N2 number of classes, there are N1 * (N2 - 1) columns that are independent
def get_independent_preds(df_columns, models=None):
    columns = [c for c in df_columns if c.startswith('model_') or c.startswith('modelClass_')]

    if len(columns[0].split('_')) < 3:
        # in case of using loss_df
        indep_cols_all = columns
    else:
        # in case of using pred_df
        non_class0 = [c for c in columns if not c.endswith('_0')]
        indep_cols_all = columns if len(non_class0) == 0 else \
            [c for c in columns if c.startswith('modelClass_') and not c.endswith('_0')]

    if (models is not None and len(models) > 0):
        return [c for c in indep_cols_all if int(c.split('_')[1]) in models]
    return indep_cols_all


class PerformanceComparison(object):

    def __init__(self, pred_df, loss_df, feature_df, uuid, model_meta):
        self.feature_df = feature_df
        self.pred_df = pred_df
        self.loss_df = loss_df
        self.uuid = uuid
        self.model_meta = model_meta
        self.metric = None
        self.metric_df = None
        self.n_clusters = None
        self.n_segments = None
        self.segment_ids = None
        self.clustering_columns = None
        self.segment_filters = None


    def set_params(self, n_clusters=None, metric='performance', base_models=None, segment_filters=None):
        is_manual = bool(segment_filters)
        should_compute_metric = self.should_compute_metric(metric)

        if should_compute_metric:
            self.metric = metric

            metric_df = self.loss_df.copy() if self.metric == 'performance' else self.pred_df.copy()
            self.ipd = get_independent_preds(metric_df.columns)

            # todo: consider cases with more than one class
            self.metric_df = metric_df[self.ipd].rename(columns={cc: 'model_' + cc.split('_')[1] for cc in self.ipd})

        if not is_manual:
            self.n_clusters = n_clusters
            self.n_segments = n_clusters
            self.clustering_columns = get_independent_preds(self.metric_df.columns, base_models)
            # todo: no need to compute each time. just need to get children_ property of the clustering model
            self.compute_clusters()

        else:
            self.segment_filters = segment_filters
            self.n_segments = len(segment_filters)
            self.compute_explicit_segments()


    def should_compute_metric(self, metric):
        if self.metric_df is None:
            return True
        return self.metric != metric


    def compute_clusters(self):
        # self.clustering_model = AgglomerativeClustering(
        #     n_clusters=self.n_clusters, affinity='euclidean', linkage='ward', compute_full_tree=True)
        self.clustering_model = KMeans(n_clusters=self.n_clusters, precompute_distances=True, random_state=0)
        segment_ids = self.clustering_model.fit_predict(self.metric_df[self.clustering_columns])

        self.metric_df['clusters'] = segment_ids
        gb = self.metric_df.groupby('clusters')

        # sorting clusters based on model_0 median performance
        mean_df = gb.aggregate(np.median).rename(columns={cc: 'model_' + cc.split('_')[1] for cc in self.ipd})
        sorted_ind = mean_df['model_0'].sort_values(ascending=True, inplace=False).index
        cluster_id_map = {v: k for (k, v) in enumerate(list(sorted_ind))}

        self.metric_df['clusters'] = self.metric_df['clusters'].apply(lambda x: cluster_id_map[x])
        self.segment_ids = self.metric_df['clusters']


    def compute_explicit_segments(self):
        full_df = pd.concat([self.pred_df, self.loss_df, self.feature_df], axis=1)
        self.segment_ids = np.zeros(full_df.shape[0])

        for i, filters in enumerate(self.segment_filters):
            filter_for_segment = compute_filter(filters, full_df)
            self.segment_ids[filter_for_segment] = i


    def get_segment_ids(self):
        return self.segment_ids


    def get_models_performance_by_segment(self):
        segments_list = []
        for s in range(self.n_segments):
            segment_mask = (self.segment_ids == s)
            segment_dict = {
                'segmentId': 'segment_' + str(s),
                'numDataPoints': segment_mask.sum(),
                'dataIds': self.uuid[segment_mask].tolist()
                # 'dataIds': np.where(self.segment_ids == c)[0].tolist()
            }
            models_list = []
            models_df = self.metric_df.loc[segment_mask]
            models_df = models_df[[c for c in models_df.columns if c.startswith('model_')]]

            for m in models_df.columns:
                model_dict = {
                    'modelId': m,
                    'modelName': self.model_meta[m],
                    'percentiles': percentiles_func(models_df[m]),
                    'density': density_func(models_df[m])
                }
                models_list.append(model_dict)

            segment_dict['modelsPerformance'] = models_list
            segments_list.append(segment_dict)

        return segments_list
