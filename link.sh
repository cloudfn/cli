#!/bin/sh

echo "Discontinued."
echo "For cloudfn-cli development:"
echo " - clone the cloudfn-system repo next to this repo"
echo " - (index.js will look for the lib.cloudfn.js there)"
echo " - use ./deploy.sh to push changes and update npm"



#
#[ -f "./lib.cloudfn.js" ] && rm "./lib.cloudfn.js"
#cp "../cloudfn-system/lib.cloudfn.js" .
#
#LIBVERSION="$(node -pe 'require("./lib.cloudfn.js").version()')"
#
#echo "lib.cloudfn.js link updated to version $LIBVERSION"#
#