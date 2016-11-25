// js@base.io

const VERSION 	= 'Rev. 4';

const fs      	= require('fs');
const path      = require('path');
const chalk     = require('chalk');
const mkdirp    = require('mkdirp');
const glob      = require('glob');

module.exports.version = () => VERSION;

/// The complete cloudfn service code library,
/// shared between the CLI- and Server-app. 




/// Utils

const Utils = {

	is_readable: (file, silent=true) => {
	    try {
	        fs.accessSync(file, 'r');
	        return true;
	    }catch(e){
	    	if( !silent) console.log("@utils is_readable(): Cant read file "+ file);
	        return false;
	    }
	},
	
	is_javascript: (file, silent=true) => {
		var info = path.parse(file);
		if( info.ext !== '.js' ){
			if( !silent) console.log("@utils is_javascript(): Only '.js' files accepted. (Got '"+ info.ext +"')");
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
	init: (path) => {
		var filename = "./tasks/"+ path +"/store.json";
		if( !Utils.is_readable(filename, true) ){
			fs.writeFileSync( filename, '{}' );
		}
	},

	save: (path, data) => {
		var filename = "./tasks/"+ path +"/store.json";
		fs.writeFileSync( filename, JSON.stringify(data, null, '  ') );
	},

	read: (path) => {
		var filename = "./tasks/"+ path +"/store.json";
		return JSON.parse( fs.readFileSync(filename).toString() ) || {};
	}
}
module.exports.store = Store;


/// Tasks

var Tasks = {
	list: {},

	add: (expressApp, user, script, tmpfile, cb) => {
		let code     = fs.readFileSync( tmpfile ).toString();
		let safecode = Sandbox.create(code);
		let jscode   = Verify.compile( safecode );

		Sandbox.restore();

        if( !jscode ) return cb(false);

        var filepath  = path.join(__dirname, 'tasks', user, script);
        //console.log({user, script, filepath});

        mkdirp(filepath, function (err) {
            if (err) return cb(false);

            fs.writeFileSync( path.join(filepath, 'index.js'), safecode);

            cb( Tasks._mount(expressApp, user, script, jscode) );
        });
	},

	mount: (user, script, jscode) => {

		Store.init( user+'/'+script );

		Tasks.list[user]                 = Tasks.list[user] || {};
	    Tasks.list[user][script]         = Tasks.list[user][script] || {};
	    Tasks.list[user][script].code    = jscode;
	    Tasks.list[user][script].fn      = function(req, res){
	        
	        console.log( chalk.green('Calling'), req.method, req.url );

	        let dataroot = user+'/'+script;
	        Runner.task( Tasks.list[user][script].code, req, res, dataroot);
	    };

        console.dir(Tasks.list, {colors:true});
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
		console.log(chalk.blue( JSON.stringify({action:'run', 'script':scriptname, args:args}, null, ' ')));

		try {
			jscode( API.create(args) );
		}catch(e){
			console.log( chalk.red("Script error:"), e.toString());
		}
		Sandbox.restore();

		var hrend = process.hrtime(hrstart);
		console.log( chalk.grey("@run complete %ds %dms"), hrend[0], hrend[1]/1000000);
		console.log("#0 here");
	},

	task: (task, req, res, dataroot) => {

		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log("@task ip:"+ ip );

		var hrstart = process.hrtime();
		var context = API.harvest(req, res, dataroot);

		try {
			task( context );
		}catch(e){
			console.log( chalk.red("Script error:"), e.toString());
		}

		Sandbox.restore();

		var hrend = process.hrtime(hrstart);
		console.log( chalk.blue("@exec "+ req.url +" completed in %ds %dms"), hrend[0], hrend[1]/1000000);
	}
}
module.exports.run = Runner;


/// API

const API = {

	create: (args) => {
		//TODO: mimic this on the server, and add express.res + express.req
		//TODO: destructure *all* args (from queryString, GET, POST, Headers etc) to a JSON args prop
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
			auth: function(opts, cb){
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
		}
	},

	harvest: (req, res, dataroot) => {

		var args = {}; // get from req, router, forms etc.

		//console.log("@harvest req.params:");
		//console.dir( req.params, {colors:true} );
		// < http://localhost:3033/js/counter/abe/lort
		// > { '0': 'abe/lort' }
		args.params = req.params['0'] || {};

		//console.log("@harvest req.query:");
		//console.dir( req.query, {colors:true} );
		args.query = req.query;

		//console.log("@harvest req.fields:");
		//console.dir( req.fields, {colors:true} );
		args.fields = req.fields || {};

		//console.log("@harvest req.files:");
		//console.dir( req.files, {colors:true} );
		args.files = req.files || {};

		console.log("@harvest req.headers:");
		console.dir( req.headers, {colors:true} );
		//args.headers = req.headers || {};
		args.origin = req.headers.referer || '';
		//args.origin = 'https://cloudfn.github.io/website/'; // test

		console.log( "args:");
		console.dir( args, {colors:true} );

		var base = API.create(args);

		base.store = Store.read(dataroot);
		base.save = (data) => {
			console.log("@api.save()", dataroot, base.store);
			Store.save(dataroot, base.store);
		}

		//base.res = res;
		//base.req = req;

		base.send = (jsonObject) => {

			// obey return format from url-query
			console.log("format?", args.query);
			if( args.query.format ){
				switch (args.query.format) {
					case 'jsonp' : 
						res.set('Content-Type', 'text/javascript');
						res.send( 'var jsonp='+ JSON.stringify(jsonObject, null, '  ') );
						break;
				}
			}else{
				res.json(jsonObject);
				//base.res.json(jsonObject);
			}
		}

		return base;
	}
}
module.exports.api = API;


/// Sandbox

var Module = require("module");

const Sandbox = {
	module_original_loadFn: Module._load,

	clean: function(){
		console.log("@sandbox clean()");
	    var keep_process = ['nextTick', '_tickCallback', 'stdout', 'console', 'hrtime', 'emitWarning', 'env'];
	    var keep_this = ['console', 'process', 'Buffer', 'setImmediate'];
	    Object.keys(this.process).map( (key) => {
	        if( keep_process.indexOf(key) < 0 ) delete this.process[key];
	    });
	    Object.keys(this).map( (key) => {
	        if( keep_this.indexOf(key) < 0 ) delete this[key];
	    });
	    //console.dir(this, {colors:true});
	    //console.dir(arguments, {colors:true});

	    //TODO:
	    // replace process.console with logger, so that the user can 
	    // write console.log(a,b,c) and have that logged to a file
	    // in the current script directory
	    // ...and provide a method to view / tail them

	    Module._load = Sandbox.load_disabled;

	    return [];
	},

	restore: () => {
	    console.log("@sandbox restore()");
	    Module._load = Sandbox.module_original_loadFn;
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
	        '    arguments = api.clean.call(this);',
	        '    // sandbox end',
	        ''
	    ].join("\n") +'    //'+ code.trim();
	}
}
module.exports.sandbox = Sandbox;