import numpy as np
from .constants import FILTER_TYPE


# transform a dict of <column name -> value range> mappings into a mask
def compute_filter(filters, full_df):
    masks = []

    for f in filters:
        filter_func = lambda x: True
        if f['key'] in full_df.columns:
            if f['type'] == FILTER_TYPE['INCLUDE'] :
                filter_func = lambda x: x[f['key']] in f['value']

            elif f['type'] == FILTER_TYPE['EXCLUDE']:
                filter_func = lambda x: x[f['key']] not in f['value']

            elif f['type'] == FILTER_TYPE['RANGE']:
                filter_func = lambda x: (f['value'][0] is None or x[f['key']] >= f['value'][0]) and \
                                        (f['value'][1] is None or x[f['key']] <= f['value'][1])

        elif f['type'] == FILTER_TYPE['FUNC']:
            filter_func = eval(f['value'])

        masks.append(full_df.apply(filter_func, axis=1).values)

    if len(masks) == 0:
        return np.ones(len(full_df), dtype=bool)
    if len(masks) == 1:
        return masks[0]
    return np.all(np.column_stack(masks), axis=1)