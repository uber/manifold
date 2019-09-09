const resolve = require('path').resolve;
const fs = require('fs');

const ROOT = resolve(__dirname, '.');
const MODULES_ROOT = resolve(ROOT, 'modules');
const ROOT_ALIAS = 'packages';

// this function looks into all packages under ./src and creates alias for local dev
// {@uber/some-package: './src/some-package'}
module.exports = () =>
  fs.readdirSync(MODULES_ROOT).reduce((aliasMap, pkg) => {
    // src/some-package
    const packagePath = resolve(MODULES_ROOT, pkg);
    if (!fs.lstatSync(packagePath).isDirectory()) {
      return aliasMap;
    }
    aliasMap[`${ROOT_ALIAS}/${pkg}`] = resolve(MODULES_ROOT, pkg, 'src');
    return aliasMap;
  }, {});
