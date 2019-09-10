import styled from 'styled-components';
import {Control} from 'packages/mlvis-common/ui';
import {ArrowDown} from 'packages/mlvis-common/icons';

import {CONTROL_MARGIN} from '../constants';

export const StyledControlContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.flexDirection};
`;

export const StyledControl = styled(Control)`
  display: ${props => (props.isHidden ? 'none' : 'flex')};
  flex: 1;
  :not(:last-child) {
    margin-right: ${props =>
      props.stackDirection === 'row' ? CONTROL_MARGIN + 'px' : 0};
  }
`;

// div is to wrap the select and the SelectArrow below
export const StyledSelect = styled.div`
  height: 36px;
  min-width: 120px;
  background-color: rgba(240, 240, 240, 0.7);
  overflow: hidden;
  position: relative;
  display: flex;
  select {
    appearance: none;
    border: 0;
    background-color: transparent;
    width: 100%;
    height: 100%;
    padding: 6px 10px;
  }
`;

export const SelectArrow = styled(ArrowDown)`
  position: absolute;
  right: 0;
  align-self: center;
  margin-right: 10px;
`;

// div is to wrap the input and the InputButtons below
export const StyledInput = styled.div`
  height: 36px;
  min-width: 120px;
  background-color: rgba(240, 240, 240, 0.7);
  overflow: hidden;
  position: relative;
  display: flex;
  input {
    appearance: none;
    border: 0;
    background-color: transparent;
    width: 100%;
    height: 100%;
    padding: 6px 10px;
  }
`;

export const InputButtons = styled.div`
  position: absolute;
  right: 0;
  align-self: center;
  display: flex;
  justify-content: stretch;
  button {
    border: 0;
    background-color: transparent;
    font-size: 18px;
    padding: 4px 10px;
    cursor: pointer;
  }
  button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  button:active,
  button:focus {
    outline: 0;
    box-shadow: none;
  }
`;

export const StyledSlider = styled.div`
  display: flex;
  align-self: center;
  justify-content: space-between;
  width: 100%;
  input[type='range'] {
    -webkit-appearance: none;
    width: 100%;
    outline: none;
    overflow: hidden;
  }
  input[type='range']::-webkit-slider-runnable-track {
    background: #acacac;
    cursor: pointer;
    height: 4px;
  }
  input[type='range']::-webkit-slider-thumb {
    background: #000;
    cursor: ew-resize;
    width: 12px;
    height: 12px;
    -webkit-appearance: none;
    margin-top: -4px;
  }
  label {
    background-color: rgba(240, 240, 240, 0.7);
    color: #5c5c5c;
    font-weight: 600;
    width: 48px;
    height: 32px;
    line-height: 32px;
    margin-left: 12px;
    text-align: center;
  }
`;

export const SegmentPanel = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px auto;
`;
