import React from 'react';
import {HELP_TYPE} from '../constants';

// page contents are auto-generated htmls using pandoc from userguide.md
// todo: add a script for automatically generate docs content.
export const HELP_PAGES = {
  [HELP_TYPE.PERF]: [
    {
      title: 'Reading performance comparison view',
      content: (
        <ol type="1">
          <li>
            <strong>X axis:</strong> performance metric. Could be log-loss,
            squared-error or raw prediction.
          </li>
          <li>
            <strong>Segments:</strong> your dataset is automatically divided
            into segments based on performance similarity between instances,
            across models.
          </li>
          <li>
            <strong>Colors:</strong> represent different models.
          </li>
        </ol>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/performance_comparison_1.png',
    },
    {
      title: 'Reading performance comparison view (contd)',
      content: (
        <ol type="1">
          <li>
            <strong>Curve:</strong> performance distribution (of one model, for
            one segment).
          </li>
          <li>
            <strong>Y axis:</strong> Data count/density.
          </li>
          <li>
            <strong>Cross:</strong> left end, center line, and right end are 25,
            50 and 75th percentile of the distribution.
          </li>
        </ol>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/performance_comparison_2.png',
    },
    {
      title: 'Example',
      content: (
        <p>
          <p>
            Data in Segment 0 has lower log-loss prediction error compared to
            Segments 1 and 2, since curves in Segment 0 is closer to the left
            side.
          </p>
          <p>
            In Segments 1 and 2, the XGBoost model performs better than the
            DeepLearning model, but DeepLearning outperforms XGBoost in Segment
            0.
          </p>
        </p>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/performance_comparison_3.png',
    },
  ],
  [HELP_TYPE.FEATURE]: [
    {
      title: 'Reading feature attribution view',
      content: (
        <ol type="1">
          <li>
            <strong>Segment groups:</strong> data slices you choose to compare
            against each other.
          </li>
          <li>
            <strong>Histogram / heatmap:</strong> distribution of data from each
            data slice, shown in corresponding color.
          </li>
          <li>
            <strong>Ranking:</strong> features are ranked by distribution
            difference between slices.
          </li>
        </ol>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/feature_attribution_1.png',
    },
    {
      title: 'Reading feature attribution view (contd)',
      content: (
        <ol type="1">
          <li>
            <strong>X axis:</strong> feature value.
          </li>
          <li>
            <strong>Y axis:</strong> Data count/density.
          </li>
          <li>
            <strong>Divergence score:</strong> measure of difference in
            distributions between slices.
          </li>
        </ol>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/feature_attribution_2.png',
    },
    {
      title: 'Example',
      content: (
        <p>
          <p>
            Data in Groups 0 and 1 have obvious difference in Features 0, 1, 2
            and 3; but they are not so different in features 4 and 5.
          </p>
          <p>
            Data in Groups 0 tend to have <em>lower</em> feature values in
            Features 0 and 1, since peak of pink curve is to the left side of
            the blue curve.
          </p>
        </p>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/feature_attribution_3.png',
    },
  ],
};
