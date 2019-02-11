const resolve = require('path').resolve;
const fs = require('fs');

const ROOT = resolve(__dirname, '.');
const PACKAGES = ['feature-list-view', 'manifold', 'mlvis-common', 'mlvis-common-ui', 'multi-way-plot', 'segment-filters'];
const PACKAGES_ROOT = resolve(ROOT, 'src');

// this function looks into all packages under ./src and creates alias for local dev
// {@uber/some-package: './src/some-package'}
module.exports = () =>
  PACKAGES.reduce((aliasMap, pkg) => {
    // src/some-package
    const packagePath = resolve(PACKAGES_ROOT, pkg);
    if (!fs.lstatSync(packagePath).isDirectory()) {
      return aliasMap;
    }
    aliasMap[`@uber/${pkg}`] = resolve(PACKAGES_ROOT, pkg);
    return aliasMap;
  }, {});