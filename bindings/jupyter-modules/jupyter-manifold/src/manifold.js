import React, {PureComponent} from 'react';
import Manifold, {
  THEME,
  loadProcessedData,
  validateInputData,
} from '@mlvis/manifold';
import {connect} from 'react-redux';

const manifoldGetState = state => state;

class ManifoldApp extends PureComponent {
  static defaultProps = {
    width: 1000,
    height: 700,
  };

  componentDidMount() {
    const {data} = this.props;
    validateInputData(data);
    this.props.dispatch(loadProcessedData(data));
  }

  render() {
    const {data, width, height, mapboxAccessToken} = this.props;
    const [valid] = validateInputData(data, true);
    if (!data || !valid) {
      return <div />;
    }
    return (
      <Manifold
        getState={manifoldGetState}
        width={width}
        height={height}
        mapboxToken={mapboxAccessToken}
        theme={THEME}
      />
    );
  }
}

export default connect()(ManifoldApp);
