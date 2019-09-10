import React from 'react';
import styled, {css, keyframes} from 'styled-components';
import {dotRange} from '@mlvis/mlvis-common/utils';

const ProgressTrack = styled.div`
  width: 100%;
  height: 2px;
  top: 2px;
  background-color: #eee;
  position: absolute;
`;

const ProgressContainer = styled.div`
  display: flex;
  width: ${props => (props.numSteps - 1) * 50 + 'px'};
  justify-content: space-between;
  position: relative;
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(33, 131, 221, 0.8);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(33, 131, 221, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 131, 221, 0);
  }
`;

const animation = css`
  ${pulse} 3s infinite;
`;

const Step = styled.div`
  position: relative;
  width: 100%;
  :last-child {
    width: 0;
  }
  :before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${props =>
      props.isFinished || props.isCurrent ? props.color : '#ccc'};
    animation: ${props => (props.isCurrent ? animation : 'none')};
    z-index: 2;
  }
  :after {
    content: '';
    position: absolute;
    width: ${props => (props.isFinished ? '100%' : '0%')};
    height: 2px;
    top: 2px;
    left: 3px;
    background-color: ${props => props.color};
    transition: width 0.5s ease-in;
  }
  :last-child:after {
    display: none;
  }
`;

export const StepProgress = ({numSteps, currentStep, color, className}) => {
  return (
    <ProgressContainer numSteps={numSteps} className={className}>
      <ProgressTrack />
      {dotRange(numSteps).map(step => (
        <Step
          key={step}
          color={color}
          isFinished={currentStep > step}
          isCurrent={currentStep === step}
        />
      ))}
    </ProgressContainer>
  );
};
