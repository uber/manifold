// @noflow
import {rootSelector, getHasBackend} from './base';
import {getMetaDataFromRaw, getFeatures, getModelPerfHistograms} from './misc';
import {createSelector} from 'reselect';

// ----------------------------------------------------------------------------------------------------------- //
// -- THE DATA SELECTORS SELECTS DATA FROM EITHER API RESPONSES OR FRONT END TRANSFORMATION RESULTS IN MISC -- //
// ----------------------------------------------------------------------------------------------------------- //

// -- computed data from API -- //
const getApiMetaData = createSelector(
  rootSelector,
  state => state.metaData
);
const getApiModels = createSelector(
  rootSelector,
  state => state.models
);
const getApiFeatures = createSelector(
  rootSelector,
  state => state.features
);

// -- computed data. Either came directly from BE API, or computed in FE -- //
export const getMetaData = createSelector(
  getHasBackend,
  getApiMetaData,
  getMetaDataFromRaw,
  (hasBackend, apiMeta = {}, feMeta = []) => {
    return hasBackend ? apiMeta : feMeta;
  }
);

export const getModelsPerformance = createSelector(
  getHasBackend,
  getApiModels,
  getModelPerfHistograms,
  (hasBackend, apiModels, feModels) => {
    return hasBackend ? apiModels : feModels;
  }
);

export const getFeaturesDistribution = createSelector(
  getHasBackend,
  getApiFeatures,
  getFeatures,
  (hasBackend, apiFeatures, feFeatures) => {
    return hasBackend ? apiFeatures : feFeatures;
  }
);
