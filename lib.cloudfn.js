// js@base.io

const VERSION 			= '0.0.2';
const TASKDIRECTORY 	= __dirname + '/tasks';
const PLUGINSDIRECTORY 	= __dirname + '/lib.cloudfn.plugins';
const USER_SCRIPT_LIFETIME = 4000;

// the lib only depends on node core modules
// but some plugins may require additional third-party modules
const fs 			= require('fs');
const os 			= require('os');
const path 			= require('path');
const util 			= require('util');




module.exports.version = () => VERSION;

/// This script is shared between the CLI- and Server-app - ALWAYS work on the file in cloudfn-system repo,
/// the deploy.sh script in ../cloudfn-cli will copy it in 

var sharedStore = {};

var cwd = process.cwd;

/// Users

const Users = {
	_usersfile: __dirname + '/users.json',
	/*
	{
	    'js': {
	        username: 'js',
	        email: 'js@base.io',
	        hash: '5d63e4a1ceeb6a83f8a3ef8f85e09955dcc4ecb75ba6e3bca376a5c502023ea0',
	        p: true,
	    },
	}
	*/
	list: {},
	load: () => {
		Users.list = JSON.parse(fs.readFileSync(Users._usersfile).toString() );
		//console.dir( Users.list );
		return Users.list;
	},
	save: () => {
		fs.writeFileSync(Users._usersfile, JSON.stringify(Users.list, null, '    '));
	},
	get: () => {
		return Users.list;
	},
	set: (username, data) => {
		Users.list[username] = data;
		Users.save();
	},
	exists: (username) => {
		return Object.keys( Users.list).indexOf(username) > -1;
	},
	verify: (username, hash) => {
		//console.log("@users.verify username, hash, users[username].hash)
		var usr = Users.list[username];
		return usr ? usr.hash === hash : false;
	},
	is_premium: (username) => {
		var usr = Users.list[username];
		//console.log("@users.premium?", username, usr.premium );
		return usr ? usr.premium : false;
	},

	cli: {
		_credentialFileName: '.cloudfn',
		_credentialFileLocations: () => {
			return [
				//path.join(__dirname, credentialFileName),
				path.join( os.homedir(), Users.cli._credentialFileName),
				//path.join( process.cwd(), credentialFileName)
			]
		},
		_local: {},
		load:() => {
			var obs  = [];
			var cfg  = {username:'', email:''};
			var file = Users.cli._credentialFileLocations()[0];
			/// Note: For now, lets use ONE config file. Maybe in the future we can allow multiple (like git)
			//Users.cli._credentialFileLocations.map( (file) => {
				if( Utils.is_readable(file) ){
					var o = JSON.parse( fs.readFileSync(file).toString() );
					obs.push( o );
					cfg = Object.assign(cfg, o);
				}
			//});
			Users.cli.local = cfg;
			//console.log("@users.cli.load: Users.cli.local:", Users.cli.local);
			//console.dir(Users.cli.local, {colors:true});
		},
		save: () => {
			/// Note: For now, lets use ONE config file. Maybe in the future we can allow multiple (like git)
			fs.writeFileSync( Users.cli._credentialFileLocations()[0], JSON.stringify(Users.cli.local, null, "  "));
		},
		get:() => { // was: getCredentials()
			return Users.cli.local;
		},
		set:( data ) => {
			Users.cli.local = Object.assign(Users.cli.local, data);
			Users.cli.save();
		}
	}
}
module.exports.users = Users;


/// Utils

const Utils = {

	is_readable: (file, silent) => {
		let quiet = silent || true;
	    try {
	        fs.accessSync(file, 'r');
	        return true;
	    }catch(e){
	    	if( !quiet) console.log("@utils is_readable(): Cant read file "+ file);
	        return false;
	    }
	},
	
	is_javascript: (file, silent) => {
		let quiet = silent || true;
		var info = path.parse(file);
		if( info.ext !== '.js' ){
			if( !quiet) console.log("@utils is_javascript(): Only '.js' files accepted. (Got '"+ info.ext +"')");
			return false;
		}
		return true;
	},

	is_match: (str, rule) => {
		// http://stackoverflow.com/a/32402438
		return res = new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
	},

	rightPad: (str, len) => {
		if( str.length >= len) return str;

		while(str.length < len ){
			str += ' ';
		}
		return str;
	},

	mkdirp: (filepath) => {
		console.log("mkdirp", filepath, fs.existsSync(filepath) );
		if( fs.existsSync(filepath) ) return;
		
		//return;

		const targetDir = filepath;
		targetDir.split('/').forEach((dir, index, splits) => {
			const parent = splits.slice(0, index).join('/');
			const dirPath = path.resolve(parent, dir);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath);
			}
		})
	},

	getSafePath: function(filepath){
		// Note: bound to {userpath} from Context
		console.log("@Utils.getSafePath > filepath", filepath);
		console.log("@Utils.getSafePath > userpath", this.userpath);

		let parts = path.parse(filepath);
		let dir   = parts.dir.replace(/\./g, '');
		return path.join(this.userpath, dir, parts.base);
	}

}
module.exports.utils = Utils;


/// Verify

const Verify = {
	compile: (code) => {
		try {
	        let factory = new Function('require', code);
	        let jscode = factory(require);
	        return (typeof jscode === 'function') ? jscode : false;
	        
	    } catch (e) {
	        console.log('@verify.compile(): Unable to compile script:', e.toString());
	        return false;
	    }
	},

	rawfile: (file) => {
		if( !Utils.is_readable(file) )  return false;
		if( !Utils.is_javascript(file)) return false;

		let code = fs.readFileSync(file).toString();
		let safecode = Sandbox.create(code);

		let jscode = Verify.compile(safecode);
		if( !jscode ){
			console.log("@verify.rawfile(): Compile failed. file: '"+ file +"'");
			return false;
		} 

		return jscode;
	}
}
module.exports.verify = Verify;


/// Store

const Store = {
	init: (filepath) => {
		var filename = path.join(filepath, 'store.json');
		if( !Utils.is_readable(filename, true) ){
			fs.writeFileSync( filename, '{}' );
		}
	},

	save: (filepath, data) => {
		var filename = path.join(filepath, 'store.json');
		fs.writeFileSync( filename, JSON.stringify(data, null, '  ') );
	},

	read: (filepath) => {
		var filename = path.join(filepath, 'store.json');
		return JSON.parse( fs.readFileSync(filename).toString() ) || {};
	}
}
module.exports.store = Store;


/// Tasks

var Tasks = {
	list: {},

	add: (user, script, tmpfile, cb) => {
		let code     = fs.readFileSync( tmpfile ).toString();
		let safecode = Sandbox.create(code);
		let jscode   = Verify.compile( safecode );

		Sandbox.restore();

		if( !jscode ) return cb(false);

		var filepath  = path.join(TASKDIRECTORY, user, script);
		console.log({user, script, filepath});

		Utils.mkdirp( filepath );
		fs.writeFileSync( path.join(filepath, 'index.js'), safecode);
		cb( Tasks.mount(user, script, jscode) );
	},

	remove: (user, script) => {
		console.log("@task.remove:", user, script, Tasks.list[user][script] );
		delete Tasks.list[user][script];
	},

	mount: (user, script, jscode) => {

		var filepath  = path.join(TASKDIRECTORY, user, script);
		Store.init( filepath );//user+'/'+script );


		Tasks.list[user] = Tasks.list[user] || {};
	    Tasks.list[user][script] = {
	    	enabled: true,
	    	created_at: new Date().toISOString(), //moment().toISOString()
	    	code: jscode,
	    	logfile: path.join(TASKDIRECTORY, user, script, 'log.txt'),
	    	fn: (req, res) => {
	    		console.log("\n\n---------------");
		        console.log( 'Calling', req.method, req.url );
		        //Runner.task( Tasks.list[user][script].code, req, res, user, script);
		        Runner.task( Tasks.list[user][script], req, res, user, script);
		    }
		};
	    return true;
	}

}
module.exports.tasks = Tasks;


/// Runner

const Runner = {

	code: (code, args) => {
		return Runner._run('code', code, args);
	},

	rawfile: (file, args) => {
		// assumes the file is *not* sandboxed
		let jscode = Verify.rawfile(file);
		if( !jscode ) return;
		return Runner._run(file, jscode, args);
	},

	file: (file, args) => {
		// assumes the file is already sandboxed
		let code = fs.readFileSync(file).toString();
		let jscode = Verify.compile(code);
		return Runner._run(file, jscode, args);
	},

	_run: (scriptname, jscode, args) => {
		var hrstart = process.hrtime();

		//console.log("@run()", typeof jscode, jscode, args);
		//console.log("@run()", scriptname, args);
		console.dir({action:'@Runner.run', 'script':scriptname, args:args}, {colors:true});

		try {

			jscode( new MockContext(args) );

		}catch(e){
			console.log( "Script error:", e.toString() );
		}
		Sandbox.restore();

		var hrend = process.hrtime(hrstart);
		console.log( "Script execution completed in %ds %dms", hrend[0], hrend[1]/1000000);
	},

	task: (task, req, res, user, script) => {

		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log("@task ip:"+ ip );

		var context = new Context(req, res, user, script);

		try {
			
			//task.logstream = fs.createWriteStream( task.logfile, {flags: 'a'} );
			task.code( context );

		}catch(e){
			console.log( "Script error:", e.toString() );
			console.log( e );

		}
	}
}
module.exports.run = Runner;




/// Mock Context
/// Used for running cli test script locally

var MockContext = function(args){
	// used for testing scripts locally

	var user = 'system'; // no, we need to get this from the cli
	var script = 'mock';

	//	var _userpath = path.join(TASKDIRECTORY, user, script);
	//	var _premium  = Users.is_premium(user);

	this.user 	= user;
	this.script = script;
	this.method = 'GET';

	this.store 	= {};
	
	this.clean 	= Sandbox.clean;

	this.args 	= Object.assign({}, Plugins.core.args( args ), args); //Plugins.core.args( args ); // relay cli args as query
	console.log("@mock args", this.args);

	this.send 	= function sendJSON(jsonObject){
		console.log("@mock.send:", JSON.stringify(jsonObject, null, "    ") );
	};
	
	this.auth 	= Plugins.core.auth;

	this.store = {
		data: sharedStore,
		save: function (data) {
			Store.save(_userpath, this.data);
			sharedStore = Object.assign(sharedStore, this.data);
			console.log("@mock store.save() >", sharedStore);
		}
	}

	return this;
}


/// Context
/// Provides the api for all scripts

var Context = function(req, res, user, script){

	var _hrstart = process.hrtime();
	var _res = res;
	var _userpath = path.join(TASKDIRECTORY, user, script);
	var _premium  = Users.is_premium(user);

	this.user  	= user;
	this.script = script;
	this.method = req.method;

	this.clean 	= Sandbox.clean;
	
	this.args 	= Plugins.core.args(req);

	this.send 	= Plugins.core.send.bind({args:this.args,res:res});

	this.auth 	= Plugins.core.auth;//.bind(this);

	this.store = {
		data: Store.read(_userpath), // the store.json file 
		save: function (data) {
			console.log("@api.store.save() _userpath:", _userpath, "this.data:", this.data);//dataroot, base.store.data);
			Store.save(_userpath, this.data);
		},
	}

	this.wait = (fn, ms) => {
		console.log("@api.wait", ms);
		this.wait_timeout = setTimeout(fn, ms);
		
		clearTimeout( this.kill_timeout );
		this.kill_timeout = setTimeout( this.kill, USER_SCRIPT_LIFETIME + ms);
	}

	
	this.next = () => {
		console.log("@api.next");

		var hrend = process.hrtime( _hrstart);
		var msg   = util.format("%s %s Completed in %ds %dms", this.method, req.url, hrend[0], hrend[1]/1000000);
		Sandbox.restore(msg);

		clearTimeout( this.kill_timeout );

		process.nextTick( () => {
	   		//task.logstream.end( '@'+ msg +'\n' );
	   		console.log("@api.next nextTick");
	   		_res.end();
	    });

	}

	this.kill = () => {
		console.log("@api.kill");
		this.next();
	}

	// Allow scripts to run async, for a while
	this.kill_timeout = setTimeout( this.kill, USER_SCRIPT_LIFETIME);

	// Load Default plugins	
	Object.keys(Plugins.default).map( (key) => {
		console.log("Loading Plugin", key);
		this[key] = Plugins.default[key].bind(this);
	});


	// Load or Mock Premium features

	this.fs = {};
	Object.keys(Plugins.premium.fs).map( (key) => {
		if( _premium ){
			this.fs[key] = Plugins.premium.fs[key].bind(this);
		}else{
			// mock.
			this.fs[key] = function(){
				var _key = key;
				console.log("Access to Premium API call denied ("+ _key +")" );
			}
		}
	});
	if( _premium ){
		this.getSafePath = Utils.getSafePath.bind({userpath:_userpath});
	}

	return this;
}





/// Plugins

const Plugins = {

	core:{},
	default:{},
	premium:{},
	
	load: () => {
		Plugins.core.args 		= require( PLUGINSDIRECTORY +'/core/args.js');
		Plugins.core.auth 		= require( PLUGINSDIRECTORY +'/core/auth.js');
		Plugins.core.send 		= require( PLUGINSDIRECTORY +'/core/send.js');		
		Plugins.premium.fs 		= require( PLUGINSDIRECTORY +'/premium/fs.js');
	},

	load_extended: () => {
		Plugins.default.request	= require( PLUGINSDIRECTORY +'/default/request.js');
	},

	list: () => {
		console.log("Enabled plugins:");
		console.dir( {
			core:Object.keys(Plugins.core),
			default:Object.keys(Plugins.default),
			premium:Object.keys(Plugins.premium)
		}, {colors:true});
	}
}

module.exports.plugins = Plugins;


/// API

const API = {
	
	/*
	plugins : {
		core:{},
		default:{},
		premium:{}
	},

	init: () => {
		//TODO: Add loader, and use a mocking lib to prevent 'cannot read property fs on undefined' errors
		
		API.plugins.core.args 		= require('./plugins/core/args.js');
		API.plugins.core.auth 		= require('./plugins/core/auth.js');
		API.plugins.core.send 		= require('./plugins/core/send.js');
		
		API.plugins.premium.fs 		= require('./plugins/premium/fs.js');

		console.log("enabled plugins:");
		console.dir( API.plugins, {colors:true} );
	},
	*/

	create: (args) => {
		//TODO: mimic this on the server, and add express.res + express.req

		return {
			store:{},
			args:args,
			clean:Sandbox.clean,
			send: function sendJSON(jsonObject){
				console.log("@api.send:", JSON.stringify(jsonObject, null, "    ") );
			},

			save: function(){
				console.log("@api.save()");
			},
			/*
			xxauth: function(opts, cb){
				console.log("@auth args:", args.Auth);
				
				if( opts.keys ){
					console.log("@auth keys:", opts.keys, opts.keys.indexOf(args.Auth));

					if( opts.keys.indexOf(args.Auth) < 0 ){
						this.send({"error":true, message:"access denied (keys)"});
						return;
					}else{
						cb();
					}
				
				}else if( opts.origins ){
					// TODO
					console.log("@auth origin:", opts.origins, args.origin );

					let allow = false;
					if( typeof opts.origins === 'string' ){ // single rule
						allow = Utils.is_match(args.origin, opts.origins);
					
					}else if( typeof opts.origins === 'object'){ // multiple rules (array)
						for(let i=0, len=opts.origins.length; i<len; i++){
							let test = Utils.is_match(args.origin, opts.origins[i]);
							if( test ) allow = true;
						}
					}
					
					if( !allow ){
						this.send({"error":true, message:"access denied (origin)"});
						return;
					}else{
						cb();
					}
				}else{
					// what here??
				}

			}
			*/
		}
	},



	harvest: (req, res, user, script) => {

/// kept - as there is some almost working logging code here that needs to be moved elsewhere

//		let dataroot = user+'/'+script;
//		let userpath = path.join(TASKDIRECTORY, dataroot);
//
//		//mock'ed req and res
//		req = req || {};
//		res = res || {
//			set: (h,m) => {
//				console.log("@base.res.set mock", h, m);
//			},
//			json: (o) => {
//				console.log("@base.res.json mock", o);
//			}
//		};
//		//console.log(req, res);
//
//		var plugs = Object.assign(API.plugins.core, API.plugins.default);
//
//		/*
//		if( Users.is_premium(user) ){
//			plugs = Object.assign(plugs, API.plugins.premium);
//		}
//
//		console.dir(API.plugins.premium.fs)
//		var boundfs = {
//			test: API.plugins.premium.fs.test.bind(this)
//		}
//		*/
//
//		var logstream = null;
//		if( Sandbox.use_console_trap ){
//			logstream = fs.createWriteStream( Tasks.list[user][script].logfile, { flags: 'a' });
//			logstream.write('\n');
//		}
//
//		var args = require('./plugins/core/args')(req);
//		var base = Object.assign(
//			{
//				clean:Sandbox.clean,
//				args:args,
//				req, 
//				res,
//				method:req.method,
//				store: {
//					data: Store.read(dataroot), // the store.json file
//					save: function (data) {
//						console.log("@api.store.save()", dataroot, base.store.data);
//						Store.save(dataroot, base.store.data); //will this work??
//					},
//				},
//				root: TASKDIRECTORY,
//				userpath: userpath,
//				dataroot: dataroot,
//				//log: logFile,
//				logstream: logstream,
//				safePath: Utils.getSafePath.bind({userpath}),
//			},
//			plugs
//			//API.plugins.core,
//			//API.plugins.default
//		);
//
//
//
//
//		//plugs = Object.assign(plugs, API.plugins.premium);
//		console.log("API.plugins.premium keys:", Object.keys(API.plugins.premium) );
//		if( Users.is_premium(user) ){
//			base.fs = {};
//			Object.keys(API.plugins.premium.fs).map( (key) => {
//				base.fs[key] = API.plugins.premium.fs[key].bind(base);
//			});
//		}
//			
//		/*
//		base.save = (data) => {
//			console.log("@api.save()", dataroot, base.store);
//			Store.save(dataroot, base.store);
//		}
//
//		base.hello = require('./plugins/hello.js');
//		base.send = require('./plugins/send.js');
//		*/
//
//		//console.log("base:"); console.dir(base);
//
//		return base;
//
	}
}
module.exports.api = API;

/*
var nativeConsole = console;
console.log("nativeConsole", nativeConsole);

var cconsole = {
	log: function(){

		nativeConsole.warn("MOCK", arguments);
	}
}
global.console = cconsole;
console.log("@test 1");
cconsole.log("@test 2");
*/

/// Sandbox

var Module = require("module");

const Sandbox = {
	module_original_loadFn: Module._load,

	//console: console,
	use_console_trap: false,
	console_trap: false,

	clean: function(apiref){
		console.log("@sandbox clean()");

		Sandbox.console_trap = false;

		//console.dir( apiref );
	    
	    var keep_process = ['nextTick', '_tickCallback', 'stdout', 'console', 'hrtime', 'emitWarning', 'env'];
	    var env_bak = this.process.env;
	    Object.keys(this.process).map( (key) => {
	        //if( keep_process.indexOf(key) < 0 ) delete this.process[key];
	    });
	    /// PM2 relies on env.MODULE_DEBUG
	    this.process.env = {MODULE_DEBUG:env_bak.MODULE_DEBUG};


	    var keep_this = ['console', 'process', 'Buffer', 'setImmediate'];
	    Object.keys(this).map( (key) => {
	        //if( keep_this.indexOf(key) < 0 ) delete this[key];
	    });
	    //console.dir(this, {colors:true});
	    //console.dir(arguments, {colors:true});

	    // Disable require()
	    Module._load = Sandbox.load_disabled;

		if( Sandbox.use_console_trap ){
		    // replace process.console with logger, so that the user can 
		    // write console.log(a,b,c) and have that logged to a file
		    // in the current script directory
		    // TODO: provide a method to view / tail them
			['log', 'info', 'warn', 'error', 'dir'].map( (key) => {
				console[key] = function(){
					let log = apiref.logstream;
					let fnkey = key;
					if( Sandbox.console_trap ){
						log.write( "type:"+ fnkey +"\t"+ util.format.apply(null, arguments) + '3');
		  				process.stdout.write("type:"+ fnkey +"\t"+ util.format.apply(null, arguments) + '\n');
					}else{
						//Sandbox.console.warn.apply(null, arguments);
						process.stdout.write( util.format.apply(null, arguments) + '\n');
					}
				}
			});

			
			
			Sandbox.console_trap = true;
		}
	   
	   	console.log("== usr begin (Method:", apiref.method, ", Dataroot:", apiref.dataroot, ")");
	    return [];
	},

	restore: (msg) => {
	    Sandbox.console_trap = false;
	    console.log("== usr end", msg);
	    //console.log(msg);

	    process.cwd = cwd;

	    Module._load = Sandbox.module_original_loadFn;
	    console.log( "@sandbox release()" );
	},

	load_disabled: (request, parent) => {
	   console.log("@sandbox load_disabled()");
	    return;
	},

	load_enabled: (request, parent) => {
    	console.log("@sandbox load_enabled()");
	    return Sandbox.module_original_loadFn(request, parent);
	},

	create: (code) => {
		return [
	        'return (api) => {',
	        '    arguments = api.clean.call(this, api);',
	        '    // sandbox end',
	        ''
	    ].join("\n") +'    //'+ code.trim();
	}
}
module.exports.sandbox = Sandbox;