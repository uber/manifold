---
title: Interpret visualizations
---

This guide explains how to interpret Manifold visualizations.

Manifold uses a clustering algorithm to create visualizations for:

-   `Model performance <model_performance>`{.interpreted-text
    role="ref"} based on different segments of your data
-   `Feature distribution <feature_distribution>`{.interpreted-text
    role="ref"} for different segments of your data

<br/><hr class="style14" />

Model performance {#model_performance}
=================

First, compare model performance and slice data subset(s) of interest.

Compare
-------

To compare model performance between models or within one model across
different segments of your data, look at the performance distribution on
the left side of Manifold. Manifold uses a clustering algorithm to break
prediction data into clusters based on performance similarity.

By default, the x-axis shows the log-loss value for classification
models and mean-squared-log-error value for regression models. The
height of the curve for each cluster maps to the number of data points.

If you\'re analyzing multiple models, each model is plotted on the same
line for the same set of data, where each model is represented with a
different color.

::: {.note}
::: {.admonition-title}
Note
:::

Models with a lower log-loss perform better than models with a higher
log-loss.
:::

For example:

![image](_static/manifold_performance_example.png)

In this example, in clusters 2 and 3, the XGBoostV1 model performs
better than the DeepLearningV1 model, but DeepLearningV1 outperforms
XGBoostV1 in cluster 1.

| **Best Practices**

-   To change the number of clusters, under **Compare** and next to
    **n\_clusters**, click **+** or **-**.
-   If you\'re comparing models, look for clusters where the log-loss is
    different for each model.

    > If two models perform differently on the same set of data,
    > consider using the better-performing model for that part of the
    > data to boost performance.

-   Look for clusters of data where the log-loss is higher (plotted to
    the right). These are areas you should analyze and try to improve.

Check out the `Manifold case studies <casestudy>`{.interpreted-text
role="ref"} to see examples of how users found insights from these types
of comparisons.

| 

Slice
-----

After you find performance trends in the clusters, slice the data to
compare feature distribution for the data subset(s) of interest. You can
create two cluster groups to compare (colored pink and grey), and each
group can have 1 or more clusters.

To slice the data:

1.  Under **Slice** and next to **Compare**, type the cluster numbers
    you want to compare.

    ![image](_static/slice_example.png)

2.  In one of the **Compare** text boxes, press **enter** to update the
    data.

<br/><hr class="style14" />

Feature distribution {#feature_distribution}
====================

After you slice the data to create cluster groups, Manifold generates
feature distribution histograms that compare the feature distribution
between the two cluster groups. Each histogram shows the KL-Divergence
score between the pink and grey cluster group distribution at the bottom
left next to the feature name.

![image](_static/kl_score_example.png)

The height of the curve maps to count. When you hover over the
histogram, the feature value is shown in black and the count for each
cluster group (pink and grey) is shown in the corresponding color.

![image](_static/feature_value_example.png)

| 

| **Best Practices**

-   Manifold only displays features with scores above the set threshold.
    Change the threshold by sliding the slider in the upper-right corner
    left and right.
-   Look for similarities between the histograms for different features.
-   To export visible feature distributions to a CSV, click **Export**.
