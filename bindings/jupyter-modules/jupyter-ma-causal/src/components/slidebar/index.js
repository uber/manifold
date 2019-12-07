import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {format as d3Format} from 'd3-format';

export default class Chart extends Component {
  static propTypes = {
    extent: PropTypes.array.isRequired,
    x: PropTypes.number,
    getEventMouse: PropTypes.func.isRequired,
    leftLabel: PropTypes.string,
    rightLabel: PropTypes.string,
    renderLeftLabel: PropTypes.bool.isRequired,
    renderRightLabel: PropTypes.bool.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    disableDrag: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    extent: [[0, 0], [1, 1]],
    renderLeftLabel: false,
    renderRightLabel: false,
    getEventMouse: event => [event.clientX, event.clientY],
    onDragStart: () => {},
    onDrag: () => {},
    onDragEnd: () => {},
    disableDrag: false,
  };

  static getDerivedStateFromProps = (props, state) => ({
    ...state,
    x: props.x === undefined ? state.x : props.x,
  });

  constructor(props) {
    super(props);
    this.state = {
      x: null,
    };
    this.move = null;
  }

  _getX = () => {
    const {extent} = this.props;
    const {x} = this.state;
    return x === null ? extent[1][0] : x;
  };

  _renderLeftBar() {
    const {
      extent: [[x0, y0], [, y1]],
    } = this.props;
    const x = this._getX();
    return <rect x={x0} y={y0} width={x - x0} height={y1} fill="#3399ff" />;
  }

  _renderRightBar() {
    const {
      extent: [[, y0], [x1, y1]],
    } = this.props;
    const x = this._getX();
    return <rect x={x} y={y0} width={x1 - x} height={y1} fill="#c2c2d6" />;
  }

  _renderLeftLabel() {
    if (!this.props.renderLeftLabel) {
      return null;
    }
    const {
      extent: [[, y0], [, y1]],
      leftLabel,
    } = this.props;
    const x = this._getX();
    return (
      <text
        x={x - 3}
        y={(y0 + y1) / 2}
        textAnchor="end"
        dominantBaseline="middle"
      >
        {leftLabel || d3Format('.2s')(x)}
      </text>
    );
  }

  _renderRightLabel() {
    if (!this.props.renderRightLabel) {
      return null;
    }
    const {
      extent: [[, y0], [, y1]],
      rightLabel,
    } = this.props;
    const x = this._getX();
    return (
      <text
        x={x + 3}
        y={(y0 + y1) / 2}
        textAnchor="start"
        dominantBaseline="middle"
      >
        {rightLabel || d3Format('.2s')(x)}
      </text>
    );
  }

  _renderTip() {
    const {
      extent: [[x0, y0], [x1, y1]],
    } = this.props;

    const x = this._getX();

    return (
      <rect
        cursor="ew-resize"
        x={x - 5}
        y={y0}
        width={10}
        height={y1}
        fill="none"
        pointerEvents={this.props.disableDrag ? 'none' : 'visible'}
        onPointerDown={event => {
          if (this.props.disableDrag) {
            return;
          }
          event.target.setPointerCapture(event.pointerId);
          this.move = this.props.getEventMouse(event);
          this.props.onDragStart({
            target: this,
            type: 'start',
            x: this.state.x,
            sourceEvent: event,
          });
        }}
        onPointerMove={event => {
          if (this.props.disableDrag) {
            return;
          }
          if (this.move) {
            const [x, y] = this.props.getEventMouse(event);
            const [sx] = this.move;
            const dx = x - sx;
            const mx = Math.min(Math.max(x + dx, x0), x1);
            this.move = [x, y];
            this.setState({x: mx});
            this.props.onDrag({
              target: this,
              type: 'drag',
              x: mx,
              sourceEvent: event,
            });
          }
        }}
        onPointerUp={event => {
          if (this.props.disableDrag) {
            return;
          }
          this.move = null;
          this.props.onDragEnd({
            target: this,
            type: 'end',
            x: this.state.x,
            sourceEvent: event,
          });
        }}
      />
    );
  }

  render() {
    return (
      <g>
        {this._renderLeftBar()}
        {this._renderRightBar()}
        {this._renderTip()}
        {this._renderLeftLabel()}
        {this._renderRightLabel()}
      </g>
    );
  }
}
