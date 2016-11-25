#!/bin/sh

[ -f "./lib.cloudfn.js" ] && rm "./lib.cloudfn.js"
cp "../cloudfn-system/lib.cloudfn.js" .

LIBVERSION="$(node -pe 'require("./lib.cloudfn.js").version()')"

echo "lib.cloudfn.js link updated to version $LIBVERSION"