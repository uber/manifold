from performance_comparison import PerformanceComparison
from feature_differentiation import FeatureDifferentiation
from data_manager import DataManager, UUID_COL


class ServiceSession(object):
    def __init__(self):
        self.data_sets = {
            'feature_dataset': None,
            'pred_datasets': None
        }
        self.data_filter = None
        self.data_manager = None
        self.performance_comparison = None
        self.feature_differentiation = None


    def load_data(self, feature_dataset=None, pred_datasets=None, data_filter=None):
        if not self.should_reload_data(feature_dataset, pred_datasets) \
            and not self.should_reapply_filter(data_filter):
            return

        # rebuild DataManager if data sources change
        if self.should_reload_data(feature_dataset, pred_datasets):
            self.data_sets = {
                'feature_dataset': feature_dataset,
                'pred_datasets': pred_datasets
            }
            self.data_manager = DataManager(feature_dataset, pred_datasets)

        if self.data_manager is None:
            return

        # rebuild PerformanceComparison and FeatureDifferentiation if data sources or filters change
        self.data_filter = data_filter
        self.data_manager.set_filters(filters=data_filter)
        pred_df = self.data_manager.get_pred_df()
        loss_df = self.data_manager.get_loss_df()
        feature_df = self.data_manager.get_feature_df()
        # todo: allow users to set model names
        n_models = self.data_manager.get_models_meta_data()['nModels']

        self.performance_comparison = PerformanceComparison(
            pred_df,
            loss_df,
            feature_df,
            uuid=feature_df[UUID_COL].values,
            model_meta={'model_' + str(i): 'model_' + str(i) for i in range(n_models)}
        )
        self.feature_differentiation = FeatureDifferentiation(feature_df)


    def should_reload_data(self, feature_dataset, pred_datasets):
        # if user already specified datasets in command line, and datasets sent from front end is None,
        # then don't reload data. Specifying datasets from command line might be disabled in the future
        if feature_dataset is None or pred_datasets is None:
            return False
        if self.data_sets['feature_dataset'] != feature_dataset or \
            self.data_sets['pred_datasets'] != pred_datasets:
            return True
        return False


    def should_reapply_filter(self, data_filter):
        return self.data_filter != data_filter


    def get_meta_data(self):
        if self.data_manager is None or self.feature_differentiation is None:
            return None
        return {
            'modelsMeta': self.data_manager.get_models_meta_data(),
            'featuresMeta': self.feature_differentiation.get_features_meta_data()
        }


    def get_models_performance_by_segment(self, n_clusters, metric, base_models, segment_filters):
        if self.performance_comparison is None:
            return None

        self.performance_comparison.set_params(
            n_clusters=n_clusters,
            metric=metric,
            base_models=base_models,
            segment_filters=segment_filters
        )
        return self.performance_comparison.get_models_performance_by_segment()


    def get_features_distribution_by_segment_group(self, segment_group_0, segment_group_1):
        if self.performance_comparison is None or self.feature_differentiation is None:
            return None

        segment_ids = self.performance_comparison.get_segment_ids()

        # use async to wait for computation to finish
        if segment_ids is None:
            return None

        self.feature_differentiation.set_params(
            segment_group_0=segment_group_0,
            segment_group_1=segment_group_1,
            segment_ids=segment_ids
        )
        return self.feature_differentiation.get_features_distribution_by_segment_group()