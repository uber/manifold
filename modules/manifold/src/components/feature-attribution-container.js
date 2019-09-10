import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {connect} from '../custom-connect';

import {COLORS} from '../constants';
import {updateSelectedInstances} from '../actions';
import {getSelectedInstances} from '../selectors/base';
import {getFeatures} from '../selectors/adaptors';
import FeatureListView from 'packages/feature-list-view';
import {LegendGroup} from 'packages/mlvis-common/ui';

const LEGEND_DATA = [
  {id: 0, name: 'data group 0'},
  {id: 1, name: 'data group 1'},
];

const Container = styled.div`
  overflow: scroll;
  width: 100%;
  height: 100%;
`;

const StyledLegend = styled(LegendGroup)`
  margin-top: 10px;
`;

const mapDispatchToProps = {updateSelectedInstances};
const mapStateToProps = (state, props) => {
  return {
    data: getFeatures(state),
    selectedInstances: getSelectedInstances(state),
  };
};

export class FeatureAttributionContainer extends PureComponent {
  static propTypes = {
    /* function to select manifold state from redux state of an application; `state => state.path.to.manifold.state` */
    selector: PropTypes.func,
    // todo: update with detailed propTypes
    data: PropTypes.arrayOf(PropTypes.object),
    width: PropTypes.number,
    colors: PropTypes.arrayOf(PropTypes.string),
    geoPositions: PropTypes.array,
    selectedInstances: PropTypes.array,
  };

  static defaultProps = {
    features: [],
    colors: [COLORS.PINK, COLORS.BLUE],
  };

  render() {
    const {data, width, colors, selectedInstances} = this.props;
    if (!data || data.length === 0) {
      return null;
    }
    return (
      <Container>
        <StyledLegend data={LEGEND_DATA} colorScale={id => colors[id]} />
        <FeatureListView
          data={data}
          width={width}
          colors={colors}
          selectedInstances={selectedInstances}
        />
      </Container>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeatureAttributionContainer);
