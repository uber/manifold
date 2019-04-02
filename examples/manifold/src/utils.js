// @noflow
/**
 * @param {Object} userData - {x: <file>, yPred: [<file>], yTrue: file}
 */
export function isDatasetIncomplete(userData) {
  const {x, yPred, yTrue} = userData;
  if (!x || !yPred || !yTrue || !yPred.length) {
    return true;
  }
  return false;
}
