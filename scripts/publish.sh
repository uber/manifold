set -ex

echo "======== PUBLISHING PACKAGE ========"

cd $MODULE_PATH
PACKAGE_VERSION="$(node -pe "require('./package.json').version")"

set +e # don't exit script if this fails
LAST_PUBLISHED_VERSION="$(npm show $PACKAGE_NAME version)"
set -e

echo "PACKAGE_VERSION: $PACKAGE_VERSION"
echo "LAST_PUBLISHED_VERSION: $LAST_PUBLISHED_VERSION"

if [ "$PACKAGE_VERSION" != "$LAST_PUBLISHED_VERSION" ]; then
    lerna exec cp package.json dist && lerna exec npm publish dist
else
    echo -e "packages not updated"
fi

echo "===================================="