import {connect as reduxConnect} from 'react-redux';

const defaultMapStateToProps = state => state;
const defaultMapDispatchToProps = dispatch => ({dispatch});

export const connect = (
  mapStateToProps = defaultMapStateToProps,
  mapDispatchToProps = defaultMapDispatchToProps,
  reduxMergeProps,
  options
) => BaseComponent => {
  const mapStateToPropsFunc =
    typeof mapStateToProps === 'function'
      ? mapStateToProps
      : (state, props) => mapStateToProps;

  const reduxMapState = (state, props) => {
    return mapStateToPropsFunc(props.selector(state), props, state);
  };

  return reduxConnect(
    reduxMapState,
    mapDispatchToProps,
    reduxMergeProps,
    options
  )(BaseComponent);
};
