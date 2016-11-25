#!/usr/bin/env node

var request 	= require('request');
var fs      	= require('fs');
var os      	= require('os');
var chalk   	= require('chalk');
var path    	= require('path');
var commander 	= require('commander');
var prompt 		= require('prompt');
var colors 		= require('colors/safe');
var isemail 	= require('isemail');
var esrever 	= require('esrever');
var hashObject  = require('hash-object');

var pkg     	= require('./package.json');

var cloudfn 	= require('../cloudfn-system/lib.cloudfn.js');
if( !cloudfn ) cloudfn = require('./lib.cloudfn.js');

console.log("Using lib.cloundfn v."+ cloudfn.version() );

var remote  	= 'http://localhost:3033';
var remote  	= 'https://cloudfn.stream';

// Features

// $ cfn add scriptfile 		: Uploads the script to the server, returns url
// $ cfn test scriptfile json 	: Verifies and runs the script locally (TODO:How to use the same api/context? Local server?)
// $ cfn rm scriptfile 			: Removes the script from the server
// $ cfn ls 					: Lists scripts/apps for the user
// $ cfn token 					: Utility to help generate unique strings (which the user can use in their api.auth() calls)
// $ cfn user 					: Creates and Updates user credentials/accounts

// (PLANNING)
// $ cfn logs 					: Opens a websocket and subscribes to (streaming) logs (pubsub)
// $ cfn logs scriptname		: Opens a websocket and subscribes to (streaming) logs (pubsub) for the provided scriptname
// $ cfn logs appname			: Opens a websocket and subscribes to (streaming) logs (pubsub) for the provided appname

// Premium (PLANNING)
// Premium features can be enabled by setting a flag on the server user account
// $ cfn pack 					: upload (and remotely run package.json --> custom modules)
// $ cfn set $app $config 		: set api.env vars
// Additional:
// - allow simple fs usage, via api.fs: E.g: api.fs.read(path), api.fs.write(path, data). Both sync, and both "jailed" to appdir


// Admin (PLANNING)
// Admin features can be enabled by setting a flag on the account (on the server)
// $ cfn dis user/app/script 	: Disable user/app/script
// $ cfn en  user/app/script 	: Enable user/app/script
// $ cfn status user/app/script : Display load/traffic for user/app/script (dashboard?)


/// Configure Commander
prompt.message = "";//cloudfn";
prompt.colors = false;

/// Setup Credentials locations
var credentialFileName = '.cloudfn';
var credentialFileLocations = [
	//path.join(__dirname, credentialFileName),
	path.join( os.homedir(), credentialFileName),
	//path.join( process.cwd(), credentialFileName)
];
/// Note: For now, lets use ONE config file. Maybe in the future we can allow multiple (like git)


commander
  .version(pkg.name +" v."+ pkg.version +", using lib.cloudfn "+ cloudfn.version() )
  .option('add <scriptfile>' , 'Add scriptfile to the cloud', _add)
  .option('rm <function>', 'Remove function', _rm)
  .option('ls', 'List active functions', _ls)
  .option('user' , 'Account/Credentials management', _user)
  .option('test <scriptfile> [JSON]' , 'Test scriptfile locally', _test)
  .option('token' , 'Unique token generator', _token)
  .option('call <endpoint>' , 'Call http endpoint', _call)
  .option('callp <endpoint>' , '(testing) Call http endpoint, using POST', _callp)
//.option('set <json object>' , 'set script env vars', _set)
  .parse(process.argv);


function _call( endpoint ){

	var url = remote + path.join('/', endpoint);
	console.log('@call url', url);

	request.get(url, (err, httpResponse, body) => {
		if( err || !httpResponse ){
			console.log( chalk.red("Network error"));
			console.log(err, httpResponse);
			return
		}
		console.log(body);
	});
}

function _callp( endpoint ){

	var url = remote + path.join('/', endpoint);
	var data = {a:1,b:"two",c:0.5};
	console.log('@callp url', url, 'with (sample) data:', {a:1,b:"two",c:0.5});

	request.post({url:url, formData:data}, (err, httpResponse, body) => {
		if( err || !httpResponse ){
			console.log( chalk.red("Network error"));
			console.log(err, httpResponse);
			return
		}
		console.log(body);
	});
}

/// Convenience function that generates a random string the user can use for auth purposes. 
function _token(){
	var len = util_args2int() || 32;
	var suid = require('rand-token').suid;
	var token = suid(len);
	console.log( esrever.reverse(token) );
}

/// Verify and do a simple test-run of the script locally
function _test(scriptfile, cb){
	
	var args = util_args2json();
	var file = path.join(__dirname, path.normalize(scriptfile));

	console.log("@testing "+ chalk.blue(file) +" with args:", args );


	//cloudfn.verify.rawfile(file);
	// or
	cloudfn.run.rawfile(file, args);

	// thinking is, that scripts might be using things available in the server.api -> which we cant "run" locally
	// req and res springs to mind. Lets see. 
}

/// Run local _test, and upload to server
function _add( scriptfile ){
	
	var file = path.normalize(scriptfile);
	var info = path.parse(file);

	if( !cloudfn.utils.is_readable(file) )  return false;
	if( !cloudfn.utils.is_javascript(file)) return false;

	prepareSecureRequest( (userconfig, hash) => {

		var url = [remote, 'a', userconfig.username, hash].join('/');
		console.log('@add url', url);

		var formData = {file:fs.createReadStream( file ), name:info.name};

		console.log( chalk.green("Adding ") + chalk.blue(file)+ " to server..." );

		request.post({url:url, formData: formData}, (err, httpResponse, body) => {
			parse_net_response(err, httpResponse, body, (body) => {
				console.log('OK Server response:', body);
				// TODO: Parse response to determine success
				// TODO: Print test instructions (curl or httpie) 
			});
		});
		
	});
}

function parse_net_response(err, httpResponse, body, cb){
	//console.log("@parse_net_response resp:", err, httpResponse, body);
	if( err || !httpResponse ){
		console.log( chalk.red("Network error"));
		console.log(err, httpResponse);
		return
	}
	
	var body = JSON.parse(body);
	//console.dir(body);
	if( body.msg == 'VERIFICATION_ERROR' ){
		return console.log( chalk.red("Could not authenticate user."));
	
	}else if( body.msg == 'NO FILE' ){
		return console.log( chalk.red("No file attached. (TODO: Display usage...)"));
	
	}else if( body.msg.indexOf('SCRIPT_ADDED_SUCCESS') === 0 ){
		return console.log( chalk.green('Success'), 'Script available @', (body.msg.split('SUCCESS:')[1]) );
	
	}else{
		cb(body);
	}
}

/// Get a list of apps / scripts in the current user account
function _ls(){
	prepareSecureRequest( (userconfig, hash) => {
		var url = [remote, 'ls', userconfig.username, hash].join('/');
		console.log('@ls url', url); 
		request.get(url, (err, httpResponse, body) => {
			parse_net_response(err, httpResponse, body, (body) => {
				//TODO: format output
				console.log("Registered functions:");
				console.dir(body.data);
			});
		});
	});
}

/// Remove function
function _rm( functionName ){
	prepareSecureRequest( (userconfig, hash) => {
		var url = [remote, 'rm', userconfig.username, hash].join('/');
		var formData = {name:functionName};
		console.log('@rm url', url); 
		request.post({url:url, formData: formData}, (err, httpResponse, body) => {
			parse_net_response(err, httpResponse, body, (body) => {
				//TODO: format output
				console.log("Registered functions:");
				console.dir(body.data);
			});
		});
	});
}


/// User management
/// Purpose: 
/// In order to upload, we need to know where to store the script (the path that will also become its url)
/// Pattern: 'https://cloudfn.stream/add/'+ $username +'/'+ $appname +'/'+ $scriptname
/// The Premium version allows setting the $appname, and can upload multiple files to it
/// and the Free version always uses 's' as the $appname
/// (The server takes care of setting it to 's' on upload)
function _user(){
	userconfig = getCredentials();

	var schema = {
		properties: {
			username: {
				description: colors.green("Username"),
				validator: /^[a-zA-Z]+$/,
				warning: 'Username must be only letters',
				default: userconfig.username,
				required: true,
				type: 'string'
			},
			email: {
				description: colors.green("Email"),
				default: userconfig.email,
				required: true,
				conform: function(value){
					return isemail.validate(value);
				},
				//format: 'email', // too sloppy
				warning: 'Email address required, see: http://isemail.info/_system/is_email/test/?all',
				type: 'string'
			},
			password: {
				description: colors.green("Password"),
				hidden: true,
				required: true,
				replace: '*',
				minLength: 5,
				warning: "Password must be at least 6 characters"
			}
		}
	};

	prompt.start();

	prompt.get(schema, function (err, result) {
		if (err) {
			console.log("");
			return 1;
		}
		console.log('Command-line input received:');
		console.log('  Username: ' + result.username);
		console.log('  Email: ' + result.email);
		console.log('  Password: ' + result.password);

		//console.log("getNearestCredentialsFile():", getNearestCredentialsFile() );

		// Credentials to store locally: username, email
		var local = JSON.stringify({
			username: result.username,
			email: result.email
		}, null, '    ');

		/// Credentials to store on the server: username, email, hash of [username, email, password]
		var userdata = {
			username: result.username,
			email: result.email,
			hash: getHash({
				username: result.username,
				email: result.email,
				pass: result.password
			})
		};

		var url = [remote, 'u', result.username, userdata.hash].join('/');
		console.log('@user url', url); 
		request.get({url:url, formData: userdata}, (err, httpResponse, body) => {
			parse_net_response(err, httpResponse, body, (body) => {
				
				console.log(body.msg);

				if( body.msg === 'allow' ){
					console.log("Credentials verified. Now using account '"+ chalk.green(result.username) +"'");
					fs.writeFileSync( getNearestCredentialsFile(), local);

				}else if( body.msg === 'deny' ){
					console.log("Login failed. (TODO: reset password... contact js@base.io for now... thanks/sorry.");
				
				}else if( body.msg === 'new' ){
					console.log("Created account for user:", chalk.green(result.username) );
					fs.writeFileSync( getNearestCredentialsFile(), local);
				}
			});
		});
	});
}


/// IN PLANNING -----------------------------------------------------------

function _set(env){
	console.log("_set() scriptfile", env);
}

/// Utils --------------------------------------------------------------

function prepareSecureRequest(cb){
	var userconfig = getCredentials();

	promptPassword(userconfig, (result) => {

		/// Create a hash of (username, email, pass) so the server can compare
		var hash = getHash({
			username: userconfig.username,
			email: userconfig.email,
			pass: result.password
		});

		cb(userconfig, hash);
	});
}

function promptPassword(conf, cb){
	
	/// Prompt for password
	var schema = {
		properties: {
			password: {
				description: colors.green("Password for user '"+ chalk.white(conf.username) +"'"),
				hidden: true,
				required: true,
				replace: '*'
			}
		}
	};

	prompt.start();

	prompt.get(schema, function (err, result) {
		if (err) {
			console.log("");
			return 1;
		}

		cb( result );
	});
}

function getCredentials(){
	var obs = [];
	var cfg = {username:'', email:''};
	credentialFileLocations.map( (file) => {
		if( cloudfn.utils.is_readable(file) ){
			var o = JSON.parse( fs.readFileSync(file).toString() );
			obs.push( o );
			cfg = Object.assign(cfg, o);
		}
	});
	//console.dir(obs, {colors:true});
	//console.dir(cfg, {colors:true});

	return cfg;
}

function getNearestCredentialsFile(){
	var f = credentialFileLocations[0];
	credentialFileLocations.map( (file) => {
		if( cloudfn.utils.is_readable(file) ){
			f=file;
		}
	});
	return f;
}

function util_args2json(){
	var array = commander.rawArgs.slice(4);
	// if only one arg (test examples/auth-token.js {Auth:bb}) is provided on the cli, it looks like: ['{Auth:bb}']
	// but if multiple args are present (test examples/auth-token.js {Auth:bb,foo:bar}), it looks like ['Auth:bb', 'foo:bar']
	if( array.length === 1 ) array = [array[0].replace(/{|}/g, "")];
	
	var args = {};
	array.map( (pair) => {
		var split = pair.split(':');
		args[ split[0] ] = isNaN(split[1]) ? split[1] : Number(split[1]);
	});

	return args;
}

function util_args2int(){
	var array = commander.rawArgs.slice(3);
	console.log(array);
	if( array.length === 1 ){
		return Number( array[0] );
	}
	return false;
}

function getHash(obj){
	return hashObject(obj, {algorithm: 'sha256'});
}
