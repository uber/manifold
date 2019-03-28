//@noflow

const resolve = require('path').resolve;
const fs = require('fs');

const ROOT = resolve(__dirname, '.');
const PACKAGES = [
  'feature-list-view',
  'manifold',
  'mlvis-common',
  'multi-way-plot',
  'segment-filters',
];
const PACKAGES_ROOT = resolve(ROOT, 'src');
const ROOT_ALIAS = 'packages';

// this function looks into all packages under ./src and creates alias for local dev
// {@uber/some-package: './src/some-package'}
module.exports = () =>
  PACKAGES.reduce((aliasMap, pkg) => {
    // src/some-package
    const packagePath = resolve(PACKAGES_ROOT, pkg);
    if (!fs.lstatSync(packagePath).isDirectory()) {
      return aliasMap;
    }
    aliasMap[`${ROOT_ALIAS}/${pkg}`] = resolve(PACKAGES_ROOT, pkg);
    return aliasMap;
  }, {});
