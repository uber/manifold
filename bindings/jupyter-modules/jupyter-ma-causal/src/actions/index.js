import {createAction} from 'redux-actions';

export const UPDATE_DATA = 'UPDATE_DATA';
export const UPDATE_SLIDER_VALUES = 'UPDATE_SLIDER_VALUES';

export const updateData = createAction(UPDATE_DATA);
export const updateSliderValues = createAction(UPDATE_SLIDER_VALUES);
