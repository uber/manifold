//@noflow
import React, {PureComponent} from 'react';
import Base from './base';

export default class More extends PureComponent {
  render() {
    return (
      <Base {...this.props} viewBox="0 0 408 408">
        <path
          d="M204,102c28.05,0,51-22.95,51-51S232.05,0,204,0s-51,22.95-51,51S175.95,102,204,102z M204,153c-28.05,0-51,22.95-51,51
    s22.95,51,51,51s51-22.95,51-51S232.05,153,204,153z M204,306c-28.05,0-51,22.95-51,51s22.95,51,51,51s51-22.95,51-51
    S232.05,306,204,306z"
        />
      </Base>
    );
  }
}
