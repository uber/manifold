export const convertToCdnUrl = fileName =>
  `https://d1a3f4spazzrp4.cloudfront.net/manifold/data/${fileName}`;

export const DATASET = {
  REG: 'REGRESSION',
  BIN: 'BINARY_CLASSIFICATION',
};

// urls for sample data
export const SAMPLE_DATA_S3 = {
  [DATASET.REG]: {
    x: 'reg_x_anon.csv',
    yPred: ['reg_y_pred_0.csv'],
    yTrue: 'reg_y_true.csv',
  },
  [DATASET.BIN]: {
    x: 'feature.csv',
    yPred: ['pred_bin_0.csv', 'pred_bin_1.csv'],
    yTrue: 'pred_reg.csv',
  },
};
