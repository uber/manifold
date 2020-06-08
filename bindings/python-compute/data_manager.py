import pandas as pd
import numpy as np
from sklearn.metrics import log_loss, mean_squared_log_error
from .utils import compute_filter


DUMMY_PREFIX_SEP = '--'
PRED_PREFIX = '@prediction:'
INDEXED_FEATURE_PREFIX = '@prediction:indexed_'

PRED_INDEX = '@prediction:predictedindexedlabel'
TARGET_INDEX = '@prediction:indexedlabel'

PRED_COL_IN = '@prediction:predict'
TARGET_COL_IN = '@prediction:target'

PRED_COL_OUT = lambda m, c: 'modelClass_{}_{}'.format(m, c)
TARGET_COL_OUT = lambda m: 'groundTruth_{}'.format(m)

UUID_COL = 'uuid'


def compute_models_meta_data(pred_dfs):
    n_models = len(pred_dfs)

    pred_cols_non_class = [PRED_INDEX, TARGET_INDEX, PRED_COL_IN, TARGET_COL_IN]
    classes = [c.replace(PRED_PREFIX, '')
               for c in pred_dfs[0].columns if c.startswith(PRED_PREFIX) and
               not c in pred_cols_non_class and not c.startswith(INDEXED_FEATURE_PREFIX)]

    n_classes = len(classes) if len(classes) != 0 else 1
    class_labels = classes if len(classes) != 0 else None

    return n_models, n_classes, class_labels


def compute_pred_col_names(n_models, n_classes):
    pred_col_names = []
    for m in range(n_models):
        for c in range(n_classes):
            pred_col_names += [PRED_COL_OUT(m, c)]
    return pred_col_names


# We require the first PRED_DATASET to have a target column.
# All following PRED_DATASET can also have it, if the target for that model is different from the first model
# If one PRED_DATASET doesn't have it, we consider the target for that model is the same as the first model
def compute_target_df(pred_dfs, n_models, use_same_target=True):
    if use_same_target:
        target_col = pred_dfs[0][TARGET_COL_IN]
        target_col.name = TARGET_COL_OUT(0)
        return pd.DataFrame(target_col)

    target_cols = []
    for m in range(n_models):
        if TARGET_COL_IN in pred_dfs[m].columns:
            target_col = pred_dfs[m][TARGET_COL_IN]
            target_col.name = TARGET_COL_OUT(m)
            target_cols.append(target_col)
    return pd.concat(target_cols, axis=1)


def compute_log_loss_per_data(pred_df, target_df, n_models, n_classes):
    loss_list = []
    if n_classes > 1:
        # classification
        log_loss_single = lambda x: log_loss([x[0]], [x[1:]], labels=list(range(n_classes)))
    else:
        # regression
        log_loss_single = lambda x: mean_squared_log_error([x[0]], [x[1:]])

    for model in range(n_models):
        try:
            ground_truth = target_df[TARGET_COL_OUT(model)].values
        except KeyError:
            ground_truth = target_df[TARGET_COL_OUT(0)].values

        eval_array = np.hstack([np.expand_dims(ground_truth, axis=1),
                                pred_df.iloc[:, model * n_classes: (model + 1) * n_classes]])
        loss_array = np.apply_along_axis(log_loss_single, 1, eval_array)
        loss_list += [np.expand_dims(loss_array, 1)]
    return np.hstack(loss_list)


def compute_loss_df(pred_df, target_df, n_models, n_classes):
    loss_array = compute_log_loss_per_data(pred_df, target_df, n_models, n_classes)
    return pd.DataFrame(loss_array, columns=['model_' + str(i) for i in range(n_models)])


def compute_pred_df(pred_dfs, n_models, n_classes, class_labels):
    pred_cols_for_classes = [PRED_PREFIX + str(c) for c in class_labels] if class_labels is not None else [PRED_COL_IN]
    pred_df = pd.concat([df[pred_cols_for_classes] for df in pred_dfs], axis=1)
    pred_df.columns = compute_pred_col_names(n_models, n_classes)
    return pred_df


class DataManager(object):

    def __init__(self, feature_dataset, pred_datasets, use_same_target=True):
        self.filters = None
        self.pred_dfs, self.feature_df = self.read_datasets(feature_dataset, pred_datasets)
        self.n_models, self.n_classes, self.class_labels = compute_models_meta_data(self.pred_dfs)

        self.pred_df = compute_pred_df(self.pred_dfs, self.n_models, self.n_classes, self.class_labels)
        self.target_df = compute_target_df(self.pred_dfs, self.n_models, use_same_target=use_same_target)
        self.loss_df = compute_loss_df(self.pred_df, self.target_df, self.n_models, self.n_classes)

        self.feature_df = self.feature_df[[c for c in self.feature_df.columns if not c.startswith(PRED_PREFIX)]]
        # We think of target as a special feature
        self.feature_df = pd.concat([self.feature_df, self.target_df], axis=1)


    @classmethod
    def read_datasets(self, feature_dataset, pred_datasets):
        pred_dfs = []
        for d in pred_datasets:
            pred_dfs.append(pd.read_csv(d))
        feature_df = pd.read_csv(feature_dataset)
        return pred_dfs, feature_df


    def set_filters(self, filters=None):
        if not filters:
            self.filters = None
        else:
            full_df = pd.concat([self.pred_df, self.loss_df, self.feature_df], axis=1)
            self.filters = compute_filter(filters, full_df)


    def get_models_meta_data(self):
        return {
            'nModels': self.n_models,
            'nClasses': self.n_classes,
            'classLabels': self.class_labels
        }


    def get_pred_dfs(self):
        return self.pred_dfs


    def get_pred_df(self):
        if self.filters is None:
            return self.pred_df
        return self.pred_df[self.filters].reset_index(drop=True)


    def get_loss_df(self):
        if self.filters is None:
            return self.loss_df
        return self.loss_df[self.filters].reset_index(drop=True)


    def get_feature_df(self):
        if self.filters is None:
            return self.feature_df
        return self.feature_df[self.filters].reset_index(drop=True)
