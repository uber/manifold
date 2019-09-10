import React from 'react';
import {HELP_TYPE} from './constants';

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
    {
      title: 'Reading geo feature view',
      content: (
        <ol type="1">
          <li>
            <strong>Feature name:</strong> when multiple geo features exist, you
            can choose which one to display on map.
          </li>
          <li>
            <strong>Color-by:</strong> if a lat-lng feature is chosen,
            datapoints are colored by group ids.
          </li>
          <li>
            <strong>Map:</strong> manifold defaults to display the location and
            density of these datapoints using heatmap.
          </li>
        </ol>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/geo_feature_1.png',
    },
    {
      title: 'Reading geo feature view (contd)',
      content: (
        <ol type="1">
          <li>
            <strong>Feature name:</strong> when choosing a hex-id feature to
            display, datapoints with the same hex-id are displayed in aggregate.
          </li>
          <li>
            <strong>Color-by:</strong> you can color the hexagons by: average
            model performance, percentage of segment group 0, or total count per
            hexagon.
          </li>
          <li>
            <strong>Map:</strong> metrics used for coloring are also shown in
            tooltips at hexagon level.
          </li>
        </ol>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/geo_feature_2.png',
    },
    {
      title: 'Example',
      content: (
        <p>
          <p>
            Look for the differences in geo location between the two colors.
            They represent the spation distribution difference between the two
            groups you previously selected.
          </p>
          <p>
            In this view, Group 0 has a more obvious tendency to be concentrated
            in downtown San Francisco area.
          </p>
        </p>
      ),
      image:
        'https://d1a3f4spazzrp4.cloudfront.net/manifold/docs/geo_feature_3.png',
    },
  ],
};
