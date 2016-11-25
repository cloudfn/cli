#!/bin/sh

VERSION="$(node -pe 'require("./package.json").version')"

git add --all .
git commit -a -m "$VERSION" --quiet
git push origin master --quiet
npm version patch
npm publish

echo "Done"
