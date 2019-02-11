// @noflow
import React, {PureComponent} from 'react';

const DEFAULT_HEADER_HEIGHT = 64;

export default class Headline extends PureComponent {
  static displayName = 'Headline';

  static defaultProps = {
    id: 'default-headline-id',
    height: DEFAULT_HEADER_HEIGHT,
    title: 'Title',
    description: 'Description',
    howTo: 'How to read these charts?',
  };

  get style() {
    const {height} = this.props;
    const FONT_COLOR = '#666';

    return {
      container: {
        height,
        padding: 5,
        position: 'relative',
      },
      title: {
        color: FONT_COLOR,
        fontSize: 18,
        fontWeight: 800,
        lineHeight: '16px',
      },
      description: {
        color: FONT_COLOR,
        fontSize: 12,
        fontWeight: 400,
        marginTop: 2,
      },
      howTo: {
        color: FONT_COLOR,
        float: 'right',
        fontSize: 12,
        lineHeight: '16px',
        position: 'relative',
        bottom: 20,
      },
      separator: {
        borderBottom: '1px dashed #DDD',
        marginTop: 4,
        width: '100%',
      },
    };
  }

  render() {
    const {id, title, description, howTo} = this.props;

    return (
      <div id={id} style={this.style.container}>
        <div style={this.style.title}>{title}</div>
        <div style={this.style.description}>{description}</div>
        <div style={this.style.howTo}>{howTo}</div>
        <div style={this.style.separator} />
      </div>
    );
  }
}
