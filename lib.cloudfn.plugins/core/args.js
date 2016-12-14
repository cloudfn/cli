
function preferNumber(val){
	if( !isNaN(parseFloat(val)) && isFinite(val) ){
		return parseFloat(val);
	}
	return val;
}

function preferNumberInObject( obj ){
	if( typeof obj == 'string' ){
		return obj;
	}else{
		let cleaned = {};
		Object.keys( obj ).map( (key) => {
			cleaned[key] = preferNumber( obj[key] );
		});
		return cleaned;
	}
}

module.exports = function(req){	
	//console.log("@core.args req.params:", req.params);
	//console.log("@core.args req.query:", req.query);
	
	var args = {}; // get from req, router, forms etc.
	
	//console.dir( req.params, {colors:true} );
	// < http://localhost:3033/js/counter/abe/lort
	// > { '0': 'abe/lort' }
	//args.params = req.params['0'] || {};

	args.params = ( req.params )
		? (req.params['0'])
			? req.params['0']
			: {} 
		: {};

	if( typeof args.params == 'string' ){
		//console.log("params is string", args.params);
		let keyvalue = {};
		var s = args.params.split(/\//g);
		//console.log("s", s);
		for(let i=0; i<s.length; i+=2){
			//keyvalue[s[i]] = s[i+1] || '';
			let val = s[i+1] || s[i]; // default to 'use key as value' when there is only one key (and no value)
			keyvalue[s[i]] = preferNumber(val);
		}
		//console.log("keyvalue", keyvalue);
		args.params = keyvalue;
	}
	args.param_keys = Object.keys(args.params);

	//console.log("@core.args req.query:");
	//console.dir( req.query, {colors:true} );
	args.query = ( req.query )
		? req.query // split into key->value?
		: '';
	args.query = preferNumberInObject(args.query);


	//console.log("@core.args req.fields:");
	//console.dir( req.fields, {colors:true} );
	args.fields = req.fields || {};

	//console.log("@core.body req.body:");
	//console.dir( req.body, {colors:true} );
	args.body = req.body || {};

	//console.log("@core.args req.files:");
	//console.dir( req.files, {colors:true} );
	args.files = req.files || {};

	//console.log("@core.args req.headers:");
	//console.dir( req.headers, {colors:true} );
	args.headers = req.headers || {};

	//args.headers = req.headers || {};
	//args.origin = req.headers.referer || '';
	//args.origin = 'https://cloudfn.github.io/website/'; // test
	args.origin = (args.headers.referer)
		? args.headers.referer
		: 'localhost';

	//good. Now, combine all user-provided args to args.data
	var collection = Object.assign({}, args.query, args.params, args.fields, args.body, args.files);
	//collection.headers = args.headers;
	collection.origin = args.origin;
	collection.raw    = args;

	//console.log("@core.args [END] args:", args);
	console.log("@core.args [END] collection:", collection);
	
	return collection;
}