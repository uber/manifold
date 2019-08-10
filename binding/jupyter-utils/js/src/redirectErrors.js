import Jupyter from 'base/js/namespace';
import {window} from 'global';

export default function() {
  window.addEventListener('error', event => {
    const msgId = Jupyter.notebook.kernel.last_msg_id;
    const cell = Jupyter.notebook.get_msg_cell(msgId);
    if (cell) {
      const {error} = event;
      cell.output_area.append_output({
        output_type: 'error',
        status: 'error',
        ename: event.error.name,
        traceback: [error.name, error.message, error.stack],
      });
    }
  });
}
