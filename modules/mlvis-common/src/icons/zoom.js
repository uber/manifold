// @noflow
// Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Base from './base';

export default class Zoom extends Component {
  static propTypes = {
    /** Set the height of the icon, ex. '16px' */
    height: PropTypes.string,
  };

  static defaultProps = {
    height: '16px',
    viewBox: '0, 0, 30, 30',
    predefinedClassName: 'data-ex-icons-zoom',
  };

  render() {
    return (
      <Base {...this.props}>
        <path
          transform="translate(7,7)"
          d="M2.33236 6.52578H0.499023V0.925781H5.99902V2.79245H2.33236V6.52578ZM9.66569 0.925781V2.79245H13.3324V6.52578H15.1657V0.925781H9.66569ZM2.33236 10.2591H0.499023V15.8591H5.99902V13.9924H2.33236V10.2591ZM13.3324 13.9924H9.66569V15.8591H15.1657V10.2591H13.3324V13.9924Z"
          fill="black"
        />
      </Base>
    );
  }
}
