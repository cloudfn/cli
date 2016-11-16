
var fs      = require('fs');

var sandbox = require('./sandbox');

function create_api_context(args){
	return {
		store:{},
		args:args,
		clean:sandbox.clean,
		send: function sendJSON(jsonObject){
			console.log("@run.send:", JSON.stringify(jsonObject, null, "    ") );
		}
	};
}

module.exports.code = function(code, args){

	var hrstart = process.hrtime();

	console.log("* EXEC CODE BEGIN");
	
	code( create_api_context(args) );

	console.log("* EXEC CODE END");

	hrend = process.hrtime(hrstart);
	console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1]/1000000);
}



module.exports.file = function(file, args){

	var hrstart = process.hrtime();

	console.log("* EXEC FILE BEGIN");
	
	let code = fs.readFileSync(file).toString();
	let factory = new Function('require', code);
    let clientCode = factory(require);
	clientCode( create_api_context(args) );

	console.log("* EXEC FILE END");

	hrend = process.hrtime(hrstart);
	console.info("Execution %s time (hr): %ds %dms", file, hrend[0], hrend[1]/1000000);
}