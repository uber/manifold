// @noflow
import React, {PureComponent} from 'react';
import {connect} from '../custom-connect';
import {console} from 'global';
import Headline from '@uber/mlvis-common-ui/headline';
import {Row, Col, Button, Input, Select, Radio} from 'antd';

import {
  fetchModels,
  fetchFeatures,
  updateMetric,
  updateNClusters,
  updateSegmentationMethod,
  updateSegmentFilters,
  updateSegmentGroups,
} from '../actions';
import {isValidSegmentGroups} from '../utils';
import {
  getHasBackend,
  getIsModelsComparisonLoading,
  getModelsComparisonParams,
  getFeatureDistributionParams,
  getIsManualSegmentation,
} from '../selectors/base';
import {getMetaData} from '../selectors/data';

const mapDispatchToProps = {
  fetchFeatures,
  fetchModels,
  updateMetric,
  updateNClusters,
  updateSegmentationMethod,
  updateSegmentFilters,
  updateSegmentGroups,
};
const mapStateToProps = (state, props) => {
  const {modelMetaData = {}} = getMetaData(state);
  return {
    hasBackend: getHasBackend(state),
    modelMetaData,
    modelComparisonParams: getModelsComparisonParams(state),
    featureDistributionParams: getFeatureDistributionParams(state),
    isModelsComparisonLoading: getIsModelsComparisonLoading(state),
    isManualSegmentation: getIsManualSegmentation(state),
  };
};

class MultiComparisonControlContainer extends PureComponent {
  get style() {
    return {
      root: {
        padding: 12,
      },
      flex: {
        display: 'flex',
        alignItems: 'center',
      },
      nonFlex: {
        // display: 'flex',
        // alignItems: 'center'
      },
      label: {
        fontSize: '13px',
        margin: '0 6px',
      },
      control: {
        margin: '0 6px',
      },
      treatmentLabel: {
        paddingBottom: '2px',
        borderBottom: '2px solid #ff0099',
      },
      controlLabel: {
        paddingBottom: '2px',
        borderBottom: '2px solid #999999',
      },
    };
  }

  _onUpdateNClusters = ({isInc}) => {
    const {modelComparisonParams, hasBackend} = this.props;
    const {nClusters} = modelComparisonParams;

    this.props.updateNClusters(isInc ? 'INC' : 'DEC');
    if (hasBackend) {
      this.props.fetchModels({
        ...modelComparisonParams,
        nClusters: nClusters + (isInc ? 1 : -1),
      });
    }
  };

  _onUpdateMetric = metric => {
    const {modelComparisonParams, hasBackend} = this.props;
    this.props.updateMetric(metric);
    if (hasBackend) {
      this.props.fetchModels({
        ...modelComparisonParams,
        metric,
      });
    }
  };

  _updateSegmentGroups = () => {
    const {
      featureDistributionParams,
      modelComparisonParams: {nClusters} = {},
    } = this.props;
    // segmentGroups is a list of 2 lists of segment id's
    const segmentGroups = [
      this.cgInput0.input.value,
      this.cgInput1.input.value,
    ].map(g => g.match(/\d+/g).map(Number));
    segmentGroups.forEach(segmentGroup => segmentGroup.sort((a, b) => a - b));

    if (isValidSegmentGroups(segmentGroups, nClusters)) {
      this.props.updateSegmentGroups(segmentGroups);
      this.props.fetchFeatures({
        ...featureDistributionParams,
        segmentGroups,
      });
    } else {
      /* eslint-disable no-console */
      console.warn('invalid segment groups');
      /* eslint-enable no-console */
    }
  };

  _onUpdateSegmentationMethod = e => {
    this.props.updateSegmentationMethod(e.target.value);
  };

  render() {
    // todo: support comparison view for multi-class cases
    const {
      modelComparisonParams,
      featureDistributionParams,
      isModelsComparisonLoading,
      isManualSegmentation,
      modelMetaData: {nClasses = 1} = {},
    } = this.props;
    const {nClusters} = modelComparisonParams;
    const {segmentGroups = [[], []]} = featureDistributionParams;
    return (
      <Row style={this.style.root}>
        <Col span={12}>
          <Headline
            title={'Compare'}
            description={'Performance of models by data segment'}
            howTo={''}
          />
          <Row>
            <Col span={12}>
              <div style={this.style.nonFlex}>
                <div style={this.style.label}> {`segmentation method:`} </div>
                <div style={this.style.control}>
                  <Radio.Group
                    defaultValue="auto"
                    style={{width: 170}}
                    size="small"
                    disabled={isModelsComparisonLoading}
                    value={isManualSegmentation ? 'manual' : 'auto'}
                    onChange={this._onUpdateSegmentationMethod}
                  >
                    <Radio value="auto">Auto</Radio>
                    <Radio value="manual">Manual</Radio>
                  </Radio.Group>
                </div>
              </div>
            </Col>
            <Col span={9} push={3}>
              <div style={this.style.flex}>
                <div style={this.style.label}> {`metric:`} </div>
                <Select
                  defaultValue="performance"
                  style={{width: 120}}
                  size="small"
                  disabled={isModelsComparisonLoading}
                  onChange={this._onUpdateMetric}
                >
                  <Select.Option value="actual" disabled={nClasses > 2}>
                    Actual
                  </Select.Option>
                  <Select.Option value="performance">Performance</Select.Option>
                </Select>
              </div>
              <div style={this.style.flex}>
                <div style={this.style.label}>
                  {' '}
                  {`n_clusters: ${nClusters}`}{' '}
                </div>
                <Button
                  size="small"
                  disabled={isModelsComparisonLoading || isManualSegmentation}
                  onClick={() => this._onUpdateNClusters({isInc: true})}
                >
                  +
                </Button>
                <Button
                  size="small"
                  disabled={isModelsComparisonLoading || isManualSegmentation}
                  onClick={() => this._onUpdateNClusters({isInc: false})}
                >
                  -
                </Button>
              </div>
            </Col>
          </Row>
        </Col>

        <Col span={6} push={6}>
          <Headline
            title={'Slice'}
            description={'Select data subset(s) of interest'}
            howTo={''}
          />

          <div style={this.style.flex}>
            <div style={this.style.label}> {'compare'} </div>
            <div style={this.style.treatmentLabel}>
              <Input
                size="small"
                placeholder={segmentGroups[0].join(',')}
                ref={input => {
                  this.cgInput0 = input;
                }}
                onPressEnter={this._updateSegmentGroups}
              />
            </div>
            <div style={this.style.label}> {'vs.'} </div>
            <div style={this.style.controlLabel}>
              <Input
                size="small"
                placeholder={segmentGroups[1].join(',')}
                ref={input => {
                  this.cgInput1 = input;
                }}
                onPressEnter={this._updateSegmentGroups}
              />
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiComparisonControlContainer);
