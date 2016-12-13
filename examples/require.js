(api) => {

    console.log("Attempting to require('fs') and read /etc/hosts:", fs.readFileSync('/etc/hosts').toString() );

    var fs = require('fs');

    api.send({ok:false});

}

