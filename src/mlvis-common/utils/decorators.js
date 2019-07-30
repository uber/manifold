import React, {PureComponent} from 'react';
import {xScaleSelectorFactory, yScaleSelectorFactory} from './selectors';
import {generateRandomId} from './gen-data';

/*
 * HOC for adding `xScale`, `yScale` props that are derived from `data` prop.
 * currently used by MultiWayPlot and SegmentGrouping
 * @{params} WrappedComponent - a react component that has the following props:
 * `data`; one or more of: `getXScale`, `getYScale`, `getXDomain`, `getYDomain`, `getXRange`, `getYRange`.
 * @{returns} a react component that has props: `xScale`, `yScale`.
 */
export const withXYScales = WrappedComponent => {
  // todo: make sure hocId is consitent throughout the returned wrapper class's lifetime.
  const hocId = generateRandomId();

  return class extends PureComponent {
    // to get props rendered on storybook
    static propTypes = WrappedComponent.propTypes;
    static defaultProps = WrappedComponent.defaultProps;
    xScaleSelector = xScaleSelectorFactory(hocId);
    yScaleSelector = yScaleSelectorFactory(hocId);
    render() {
      const derivedData = {
        xScale: this.xScaleSelector(this.props),
        yScale: this.yScaleSelector(this.props),
      };
      return <WrappedComponent {...this.props} {...derivedData} />;
    }
  };
};
