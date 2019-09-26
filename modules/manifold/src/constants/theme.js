import {LightTheme} from 'baseui';

export const THEME_COLOR = '#276ef1';
const CONTROL_BG_COLOR = 'rgba(235, 235, 235, 0.7)';

// refer to default theme at https://baseweb.design/guides/theming/#the-shape-of-the-theme-file
// and style implementation at https://github.com/uber-web/baseui/blob/master/src/some-component/styled-components.js to override
export const OVERRIDE_COLORS = {
  borderFocus: THEME_COLOR,

  // tagPrimarySolidBackground: THEME_COLOR,
  // tagPrimarySolidFontHover: THEME_COLOR,

  inputFill: CONTROL_BG_COLOR,
};

export default {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    ...OVERRIDE_COLORS,
  },
};
