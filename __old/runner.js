
var fs      = require('fs');
var chalk 	= require('chalk');
var sandbox = require('./sandbox');

function create_api_context(args){
	//TODO: mimic this on the server, and add express.res + express.req
	//TODO: destructure *all* args (from queryString, GET, POST, Headers etc) to a JSON args prop
	return {
		store:{},
		args:args,
		clean:sandbox.clean,
		send: function sendJSON(jsonObject){
			console.log("@run.send:", JSON.stringify(jsonObject, null, "    ") );
		},
		auth: function(opts, cb){
			console.log("@auth args:", args.Auth);
			
			if( opts.keys ){
				console.log("@auth keys:", opts.keys, opts.keys.indexOf(args.Auth));

				if( opts.keys.indexOf(args.Auth) < 0 ){
					this.send({"error":true, message:"access denied (keys)"});
					//TODO: res.end();
					return;
				}else{
					cb();
				}
			}else if( opts.origins ){
				// TODO
			}


		}
	};
}
/*
module.exports.code = function(code, args){

	var hrstart = process.hrtime();

	console.log("* EXEC CODE BEGIN");
	
	code( create_api_context(args) );

	console.log("* EXEC CODE END");

	hrend = process.hrtime(hrstart);
	console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1]/1000000);
}
*/
module.exports.code = function(code, args){

	var hrstart = process.hrtime();

	console.log( chalk.grey("-- EXEC CODE BEGIN --"));
	
	code( create_api_context(args) );

	hrend = process.hrtime(hrstart);
	console.log( chalk.grey("-- EXEC CODE END (%ds %dms) --"), hrend[0], hrend[1]/1000000);
}


module.exports.file = function(file, args){

	var hrstart = process.hrtime();

	console.log( chalk.grey("-- EXEC FILE BEGIN --"));
	
	let code = fs.readFileSync(file).toString();
	let factory = new Function('require', code);
	let clientCode = factory(require);
	clientCode( create_api_context(args) );

	hrend = process.hrtime(hrstart);
	console.log( chalk.grey("-- EXEC FILE END (%ds %dms) --"), hrend[0], hrend[1]/1000000);
}