// Extra helpers for redux
// We are exposing this because react-palm has no UMD module and
// users need taskMiddleware to initiate their redux middle ware
import {enhanceReduxMiddleware as keplerEnhanceMiddleware} from 'kepler.gl/middleware';

/**
 * This method is used to pass kepler `enhanceReduxMiddleware` to support react-palm
 * @param middlewares current redux middlewares
 * @returns {*[]} the original list of middlewares plus the react-palm middleware
 */
export function enhanceReduxMiddleware(middlewares = []) {
  return keplerEnhanceMiddleware(middlewares);
}
