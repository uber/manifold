import {window} from 'global';

// This file contains the javascript that is run when the notebook is loaded.
// It contains some requirejs configuration and the `load_ipython_extension`
// which is required for any notebook extension.

// Configure requirejs
if (window.require) {
  window.require.config({
    map: {
      '*': {
        mlviswidget: 'nbextensions/mlvis/index',
      },
    },
  });
}

// Export the required load_ipython_extention
export default {
  load_ipython_extension: function() {},
};
