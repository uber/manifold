import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import memoize from 'lodash.memoize';

import {ThemeProvider} from 'baseui';
import {Select, SIZE} from 'baseui/select';
import {VARIANT} from 'baseui/tag';
import {Slider} from 'baseui/slider';
import {FILTER, FIELD, THEME} from '../../../constants';
import {FILTER_TYPE} from '@mlvis/mlvis-common/constants';

const Container = styled.div`
  padding: 0 16px;
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const Header = styled.div`
  color: #999;
  font-size: 12px;
  font-weight: 500;
  overflow-wrap: break-word;
  margin: 10px 0;
`;

const round = (n, decimal = 2) => {
  const scale = Math.pow(10, decimal);
  return Math.round(n * scale) / scale;
};

// locally override theme
const localTheme = {
  ...THEME,
  colors: {
    ...THEME.colors,
    // background of select
    inputFill: 'rgba(240, 240, 240, 0.3)',
    // outline of multi-select tags
    tagPrimaryOutlinedBackground: '#ddd',
  },
};

// override baseui slider ticks
const TickOverrides = ({children}) => <div>{round(children)}</div>;

export default class SegmentFilter extends PureComponent {
  static propTypes = {
    filter: FILTER.isRequired,
    columnDef: FIELD.isRequired,
    onUpdateFilterValue: PropTypes.func,
  };

  static defaultProps = {
    onUpdateFilterValue: () => {},
  };

  state = {
    selectedDomain: [],
  };

  _computeOptions = memoize(
    columnDef => {
      return columnDef.domain.map(domainVal => ({
        id: domainVal,
      }));
    },
    columnDef => columnDef.tableFieldIndex
  );

  _getValuesFromOptions = options => options.map(o => o.id);

  _onUpdateFilterValue = ({value, type}) => {
    const {segmentId, filterId, onUpdateFilterValue} = this.props;
    const _value =
      type === 'select' ? this._getValuesFromOptions(value) : value;
    onUpdateFilterValue(segmentId, filterId, _value);
  };

  _renderFilterControl = () => {
    const {filter, columnDef} = this.props;
    if (!filter || !columnDef) {
      return null;
    }
    const min = columnDef.domain[0];
    const max = columnDef.domain[columnDef.domain.length - 1];

    switch (filter.type) {
      case FILTER_TYPE.RANGE:
        return (
          <Slider
            key={filter.key}
            min={min}
            max={max}
            value={filter.value}
            onChange={this._onUpdateFilterValue}
            overrides={{
              Tick: {
                component: TickOverrides,
                style: {
                  ...THEME.typography.font100,
                  paddingLeft: THEME.sizing.scale300,
                  paddingRight: THEME.sizing.scale300,
                },
              },
              ThumbValue: {style: {...THEME.typography.font100}},
              Track: {
                style: {
                  paddingTop: THEME.sizing.scale900,
                  paddingBottom: THEME.sizing.scale500,
                  paddingLeft: THEME.sizing.scale300,
                  paddingRight: THEME.sizing.scale300,
                },
              },
            }}
          />
        );
      case FILTER_TYPE.INCLUDE:
        return (
          <Select
            key={filter.key}
            size={SIZE.compact}
            options={this._computeOptions(columnDef)}
            value={filter.value.map(val => ({id: val}))}
            labelKey="id"
            valueKey="id"
            searchable={true}
            multi={true}
            onChange={this._onUpdateFilterValue}
            overrides={{
              Root: {style: {paddingBottom: '10px'}},
              MultiValue: {
                props: {variant: VARIANT.outlined},
                style: {borderWidth: '1px'},
              },
            }}
          />
        );
      default:
        return <div>{`Feature type ${columnDef.type} not supported.`}</div>;
    }
  };

  render() {
    const {filter} = this.props;
    if (!filter) {
      return null;
    }

    return (
      <Container>
        <Header>{filter.name}</Header>
        <ThemeProvider theme={localTheme}>
          {this._renderFilterControl()}
        </ThemeProvider>
      </Container>
    );
  }
}
