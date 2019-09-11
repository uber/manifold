const resolve = require('path').resolve;
const fs = require('fs');

const ROOT = resolve(__dirname, '.');
const MODULES_ROOT = resolve(ROOT, 'modules');

// this function looks into all packages under ./src and creates alias for local dev
// {@mlvis/some-package: './modules/some-package/src'}
module.exports = modulesDir => () => {
  const mdir = modulesDir || MODULES_ROOT;
  return fs.readdirSync(mdir).reduce((aliasMap, pkg) => {
    // src/some-package
    const packagePath = resolve(mdir, pkg);
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
    aliasMap[packageInfo.name] = resolve(mdir, packageName, 'src');
    return aliasMap;
  }, {});
};
