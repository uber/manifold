import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Cancel} from '@mlvis/mlvis-common/icons';
import {StepProgress} from './step-progress';

const Modal = styled.div`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: fixed;
  z-index: 5000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7);
`;

const ModalBox = styled.div`
  margin: 100px auto auto auto;
  width: 600px;
  padding: 24px;
  background-color: #fff;
  border-radius: 3px;
  position: relative;
`;

const IconButton = styled.div`
  cursor: pointer;
  margin-right: 8px;
  padding: 12px;
  position: absolute;
  right: 0;
  top: 0px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const StyledButton = styled.button`
  color: ${props =>
    props.isPrimary ? '#fff' : props.disabled ? '#aaa' : props.color};
  background-color: ${props =>
    props.isPrimary ? (props.disabled ? '#ccc' : props.color) : 'transparent'};
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  border: none;
  border-radius: 3px;
  padding: 4px 16px;
  :not(:last-child) {
    margin-right: 10px;
  }
`;

const StyledProgress = styled(StepProgress)`
  margin-bottom: 16px;
`;

const PageContent = styled.div``;
const PageTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
`;
const TextArea = styled.div`
  /** important to control the height of each item so that the modal doesn't change size unexpectedly */
  height: 110px;
  overflow-y: scroll;
  margin-bottom: 12px;
`;
const ImgArea = styled.div`
  width: 100%;
  /** important to control the height of each item so that the modal doesn't change size unexpectedly */
  height: 280px;
  overflow: hidden;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  img {
    max-height: 100%;
    width: auto;
  }
`;

const Page = ({title, content, image}) => (
  <PageContent>
    <PageTitle>{title}</PageTitle>
    <TextArea>
      <div>{content}</div>
    </TextArea>
    <ImgArea>
      <img src={image} />
    </ImgArea>
  </PageContent>
);

export default class Hints extends PureComponent {
  static propTypes = {
    /** True if the side bar is open. */
    isOpen: PropTypes.bool,
    /** Callback on toggle open the side bar. */
    onToggleOpen: PropTypes.func,
    /** Theme color of app */
    themeColor: PropTypes.string,
    /** Content to display in this dialog, organized in pages. */
    pages: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        content: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        image: PropTypes.string,
      })
    ),
  };

  static defaultProps = {
    isOpen: false,
    themeColor: '#000',
    pages: [],
    onToggleOpen: () => {},
  };

  state = {
    currentPage: 0,
  };

  _onClose = () => {
    this.setState(
      {
        currentPage: 0,
      },
      this.props.onToggleOpen(false)
    );
  };

  _onClickPrev = () => {
    this.setState({
      currentPage: Math.max(this.state.currentPage - 1, 0),
    });
  };

  _onClickNext = () => {
    this.setState({
      currentPage: Math.min(
        this.state.currentPage + 1,
        this.props.pages.length - 1
      ),
    });
  };

  render() {
    const {isOpen, themeColor, pages} = this.props;
    const {currentPage} = this.state;
    return (
      <Modal isOpen={isOpen}>
        <ModalBox>
          <IconButton onClick={this._onClose}>
            <Cancel height="10" width="10" color="#aaa" />
          </IconButton>
          <StyledProgress
            numSteps={pages.length}
            currentStep={currentPage}
            color={themeColor}
          />
          <Page {...pages[currentPage]} />
          <ButtonGroup>
            <StyledButton
              color={themeColor}
              onClick={this._onClickPrev}
              disabled={currentPage === 0}
            >
              Prev
            </StyledButton>
            <StyledButton
              color={themeColor}
              onClick={this._onClickNext}
              disabled={currentPage === pages.length - 1}
              isPrimary
            >
              Next
            </StyledButton>
          </ButtonGroup>
        </ModalBox>
      </Modal>
    );
  }
}
