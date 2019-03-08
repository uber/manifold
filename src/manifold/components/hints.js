//@noflow
import React, {PureComponent} from 'react';

export default class Hints extends PureComponent {
  static defaultProps = {
    hintType: '',
  };

  render() {
    const {hintType} = this.props;
    return <div>{hintType}</div>;
  }
}
