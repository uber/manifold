// @noflow
import React, {PureComponent} from 'react';
import {connect} from '../custom-connect';
import {SegmentFilters} from '@uber/segment-filters';

import {fetchBackendData, fetchModels, updateSegmentFilters} from '../actions';
import {
  getHasBackend,
  getModelsComparisonParams,
  getIsManualSegmentation,
} from '../selectors/base';
import {getSegmentFilterAttributes} from '../selectors/adaptors';

const mapDispatchToProps = {
  fetchBackendData,
  fetchModels,
  updateSegmentFilters,
};
const mapStateToProps = (state, props) => {
  return {
    hasBackend: getHasBackend(state),
    featuresMeta: getSegmentFilterAttributes(state),
    modelComparisonParams: getModelsComparisonParams(state),
    isManualSegmentation: getIsManualSegmentation(state),
  };
};

class FiltersContainer extends PureComponent {
  _handleChangeSegmentFilters = segmentFilters => {
    const {hasBackend, modelComparisonParams} = this.props;
    const convertedFilters = segmentFilters.map(segmentFilter =>
      segmentFilter.filters.filter(filterElement =>
        Boolean(filterElement.value)
      )
    );
    this.props.updateSegmentFilters(convertedFilters);

    if (hasBackend) {
      this.props.fetchModels({
        ...modelComparisonParams,
        segmentFilters: convertedFilters,
      });
    }
  };

  render() {
    const {isManualSegmentation, featuresMeta} = this.props;
    return isManualSegmentation ? (
      <SegmentFilters
        withPadding={false}
        attributes={featuresMeta}
        updateSegmentFilters={this._handleChangeSegmentFilters}
      />
    ) : null;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FiltersContainer);
