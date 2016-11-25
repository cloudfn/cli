#!/bin/sh

VERSION="$(node -pe 'require("./package.json").version')"

[ -f "./lib.cloudfn.js" ] && rm "./lib.cloudfn.js"
cp "../cloudfn-system/lib.cloudfn.js" .
LIBVERSION="$(node -pe 'require("./lib.cloudfn.js").version()')"

echo "lib.cloudfn.js link updated to version $LIBVERSION"

git add .
git commit -a -m "$VERSION" --quiet
git push origin master --quiet
npm version patch
npm publish

echo "Done"
