
var request = require('request');
var fs      = require('fs');
var chalk   = require('chalk');
var path    = require('path');

// Features
// cfn add scriptfile
// cfn test scriptfile res.query
// cfn ls
// cfn set $app $config

// Premium
// cfn login
// cfn pack : upload (and remotely run package.json --> custom modules)



/// called like $ node cli.js script.js 
/// should be ops script.js
var source_file = process.argv[2];
console.log("source_file", source_file); 

if( !source_file ){
  console.log('Usage:...');
  return;
}


var user    = 'baseio';
var app     =  source_file.split('/').slice(-1)[0].split('.').slice(0,-1).join('.');
//var remote  = 'http://127.0.0.1:3033/add/'+ user +'/'+ app;
//var remote  = 'http://139.59.142.129:3033/add/'+ user +'/'+ app;
var remote  = 'https://cloudfn.stream/add/'+ user +'/'+ app;



var formData = {
  //source: new Buffer([1, 2, 3]),
  js_file: fs.createReadStream( source_file )
  //js_file: fs.readFileSync( source_file )
};

console.log( chalk.green("Adding ") + chalk.blue(source_file)+ " to "+ chalk.grey(remote.replace('add/', '')), '...' );

request.post({url:remote, formData: formData}, (err, httpResponse, body) => {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body, err);
});