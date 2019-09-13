import React, {PureComponent} from 'react';
import Jupyter from 'base/js/namespace';
import {selectors} from '@mlvis/manifold';
import {connect} from 'react-redux';

const mapStateToProps = state => ({
  segments: selectors.compute.getDataIdsInSegmentGroups(state),
});

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  height: 30,
  backgroundColor: '#80ced6',
  padding: '5px 5px',
  cursor: 'pointer',
};

class Button extends PureComponent {
  render() {
    const {widgetModel, segments} = this.props;
    return (
      <div
        style={buttonStyle}
        onClick={event => {
          if (widgetModel) {
            const segStr = JSON.stringify(segments);
            if (segStr !== widgetModel.get('segments')) {
              widgetModel.set('segments', JSON.stringify(segments));
              widgetModel.save_changes();
            } else {
              // TODO: clean this up, there are duplicate code in the widget part
              const msgId = Jupyter.notebook.kernel.last_msg_id;
              const cell = Jupyter.notebook.get_msg_cell(msgId);
              const cellIndex = Jupyter.notebook.find_cell_index(cell);
              const newCell = Jupyter.notebook.insert_cell_below(
                'code',
                cellIndex
              );
              newCell.set_text(`segments = ${segStr}`);
              newCell.execute();
            }
          }
        }}
      >
        Export Segmentation
      </div>
    );
  }
}

export default connect(mapStateToProps)(Button);
