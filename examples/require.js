(api) => {

    var fs = require('fs');
    console.log("Require fs, read /etc/hosts:", fs.readFileSync('/etc/hosts').toString() );

    api.send({ok:true});

}

