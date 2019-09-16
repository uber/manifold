import {window} from 'global';
import Jupyter from 'base/js/namespace';

// Frontend error handling
window.addEventListener('error', event => {
  const msgId = Jupyter.notebook.kernel.last_msg_id;
  const cell = Jupyter.notebook.get_msg_cell(msgId);
  if (cell) {
    const {error} = event;
    cell.output_area.append_output({
      output_type: 'error',
      ename: error.name,
      evalue: error.message,
      traceback: ['Javascript Error', error.stack],
    });
    cell.output_area.element
      .find('.output_subarea.output_error')
      .css({'background-color': '#ff9999'});
  }
});

export * from './widgets';
