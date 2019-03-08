// @noflow
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

class Base extends PureComponent {
  static displayName = 'Base Icon';

  static propTypes = {
    /** Set the height of the icon, ex. '16px' */
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Set the width of the icon, ex. '16px' */
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Set the viewbox of the svg */
    viewBox: PropTypes.string,
    /** Path element */
    children: PropTypes.node,
    predefinedClassName: PropTypes.string,
    className: PropTypes.string,
  };

  static defaultProps = {
    height: null,
    width: null,
    viewBox: '0 0 64 64',
    predefinedClassName: '',
    className: '',
  };

  render() {
    const {
      height,
      width,
      viewBox,
      style = {},
      children,
      predefinedClassName,
      className,
      ...props
    } = this.props;
    const svgHeight = height;
    const svgWidth = width || svgHeight;
    /* 'currentColor' will inherit the color of the parent element */
    style.fill = 'currentColor';
    return (
      <svg
        viewBox={viewBox}
        width={svgWidth}
        height={svgHeight}
        style={style}
        className={`${predefinedClassName} ${className}`}
        {...props}
      >
        {children}
      </svg>
    );
  }
}

export default Base;
