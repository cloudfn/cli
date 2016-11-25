#!/bin/sh

VERSION="$(node -pe 'require("./package.json").version')"

[ -f "./lib.cloudfn.js" ] && rm "./lib.cloudfn.js"
cp "../cloudfn-system/lib.cloudfn.js" .

git add .
git commit -a -m "$VERSION" --quiet
git push origin master --quiet
npm version patch
npm publish

echo "Done"
