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
    // packages/some-package/package.json
    const packageJsonPath = resolve(packagePath, 'package.json');
    // bypass alias mapping if no package.json exists
    if (!fs.existsSync(packageJsonPath)) {
      return aliasMap;
    }
    const packageInfo = require(packageJsonPath);
    // @mlvis/some-package => some-package
    const packageName = packageInfo.name.replace(/^(@mlvis\/)/, '');

    // TODO: use this instead when each module is done refactoring
    // {@mlvis/some-package: './modules/some-package/src'}
    // aliasMap[packageInfo.name] = resolve(packageDir, packageName, 'src');

    // TODO: replace all reference to packages/... to @mlvis/some-package inside
    // each module
    // {'packages/some-package' : './modules/some-package/src'}
    aliasMap[`${ROOT_ALIAS}/${pkg}`] = resolve(MODULES_ROOT, pkg, 'src');
    return aliasMap;
  }, {});
