from mlvis.widget import CommonComponent
from traitlets import Unicode, observe
import warnings
import pandas as pd
import numpy as np

class Manifold(CommonComponent):
    _model_name = Unicode('ManifoldWidgetModel').tag(sync=True)
    _view_name = Unicode('ManifoldWidgetView').tag(sync=True)
    segments = Unicode('[]').tag(sync=True)


    def __init__(self, props={}):
        if 'data' not in props:
            raise Exception('data must be specified')

        data = props['data']

        valid, exception = self.validate_data(data, give_exception=True)
        if not valid:
            if isinstance(exception, Warning):
                warnings.warn(exception)
            else:
                raise exception

        is_numerical_feature = self.check_is_numerical_feature(data['yPred'])
        props['data']['x'] = self.process_x(props['data']['x'])
        props['data']['yPred'] = self.process_y_pred(props['data']['yPred'])
        props['data']['yTrue'] = self.process_y_true(props['data']['yTrue'], is_numerical_feature)
        super(Manifold, self).__init__(props)


    @observe('segments')
    def _observe_bar(self, change):
        print(change['old'])
        print(change['new'])


    def validate_data(self, data, give_exception=False):
        if not isinstance(data, dict):
            return False if not give_exception else (False, Exception('Data must in dict.'))
        for key in ['x', 'yPred', 'yTrue']:
            if key not in data:
                return False if not give_exception else (False, Exception('Missing data attribute ' + key + '.'))
        for key in data:
            if key not in ['x', 'yPred', 'yTrue']:
                return False if not give_exception else (False, UserWarning('Unrecognized data attribute ' + key + '.'))
        for key in ['x', 'yTrue']:
            if not isinstance(data[key], list) and not isinstance(data[key], np.ndarray) and not isinstance(data[key], pd.DataFrame):
                return False if not give_exception else (False, Exception(key + ' must be a list/ndarray/dataframe.'))
        if not isinstance(data['yPred'], list) and not isinstance(data['yPred'], np.ndarray):
            return False if not give_exception else (False, Exception(key + ' must be a list/ndarray.'))
        for key in ['x', 'yPred', 'yTrue']:
            if len(data[key]) == 0:
                return False if not give_exception else (False, Exception(key + ' can not be empty.'))
        for l in data['yPred']:
            if not (isinstance(l, list) or isinstance(l, pd.DataFrame)):
                return False if not give_exception else (False, Exception('Every item in yPred must be list/DataFrame.'))
        return True if not give_exception else (True, None)


    def check_is_numerical_feature(self, y_pred):
        if isinstance(y_pred[0], pd.DataFrame):
            return y_pred[0].shape[1] == 1
        else:
            return len(y_pred[0]) == 1


    def process_x(self, x):
        """
        Convert the x data frame into the format manifold recognizes
        :param x: An ndarray/list for the feature list
        :return: A list for the x attribute of the data that with the manifold data format
        """
        if isinstance(x, pd.DataFrame):
            return x.to_dict('records')
        elif isinstance(x, np.ndarray):
            return x.tolist()
        else:
            return x


    def process_y_pred(self, y_pred):
        """
        Convert y pred feature -- the predictions of each features for each model into the manifold recognized informat
        :param y_pred: A ndarray/list of data frames. Each data frame is the predict probability of one model,
            which each column being the predicted probability for one class
        :return: A list for the y_pred attribute with the manifold data format
        """
        if isinstance(y_pred, np.ndarray):
            return [y.to_dict('records') if isinstance(y, pd.DataFrame) else y for y in np.nditer(y_pred)]
        else:
            return [y.to_dict('records') if isinstance(y, pd.DataFrame) else y for y in y_pred]


    def process_y_true(self, y_true, is_numerical=False):
        """
        Convert y true feature into the format manifold recognizes
        :param y_true: An ndarray/list for the ground truth
        :return: A list of the ground truths with the manifold data format
        """
        if isinstance(y_true, pd.DataFrame):
            return y_true.iloc[:, 0].tolist() if is_numerical else y_true.to_dict('records')
        elif isinstance(y_true, np.ndarray):
            return y_true.tolist()
        else:
            return y_true
