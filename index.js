#!/usr/bin/env node

var request 	= require('request');
var fs      	= require('fs');
var chalk   	= require('chalk');
var path    	= require('path');
var commander 	= require('commander');

var pkg     	= require('./package.json');
var verify      = require('./verify');

var user    = 'baseio';
//var app     =  source_file.split('/').slice(-1)[0].split('.').slice(0,-1).join('.');
//var remote  = 'http://127.0.0.1:3033/add/'+ user +'/'+ app;
//var remote  = 'http://139.59.142.129:3033/add/'+ user +'/'+ app;
var remote  = 'https://cloudfn.stream/add/'+ user +'/';
//var remote  = 'https://cloudfn.stream/add/'+ user +'/'+ app;

// Features
// cfn add scriptfile
// cfn test scriptfile res.query
// cfn ls
// cfn set $app $config

// Premium
// cfn login
// cfn pack : upload (and remotely run package.json --> custom modules)

commander
  .version(pkg.name +" v."+ pkg.version)
  .option('add <scriptfile>' , 'add scriptfile to the cloud', _add)
  .option('test <scriptfile> [args]' , 'test scriptfile', _test)
  .option('set <json object>' , 'set script env vars', _set)
  .parse(process.argv);



function _add( scriptfile ){
	/*
	var file = path.normalize(scriptfile);
	var info = path.parse(file);

	var source = getFile(scriptfile);
	if( !source ) return;

	var url  = remote + info.name;
	var formData = { js_file: fs.createReadStream( file )};

	console.log( chalk.green("Adding ") + chalk.blue(file)+ " to "+ chalk.grey(url), '...' );

	request.post({url:url, formData: formData}, (err, httpResponse, body) => {
		if (err) {
			return console.error('upload failed:', err);
		}
		console.log('Server response:', body);
		// TODO: Parse response to determine success
		// TODO: Print test instructions (curl or httpie) 
	});
	*/
}


function _test(scriptfile, args){
	args = args || {a:1};

	console.log("_test() scriptfile", scriptfile, args);

	verify("examples/highscores.js", (err, info, file) => {
		console.log("_test() completed for ", file, (err? 'WITH ERROR':'OK'));
	});

	/*
	verify(scriptfile, (err, info, file) => {
		console.log("_test() completed for ", file, (err? 'WITH ERROR':'OK'));
	});
	*/
	
}

function _set(env){
	console.log("_set() scriptfile", env);
}
