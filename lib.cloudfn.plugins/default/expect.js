

var Validator = require('./expect-validator-dist.js');
/// https://github.com/skaterdav85/validatorjs
/// we're using the version from it's dist folder,
/// copied relative to this script,
/// because the normal node_modules version uses require(),
/// and that has been disabled by the sandbox...

var slug = require('./expect-slug-browser.js');

Validator.register('slug', function(value, requirement, attribute) {
	return true;
}, '--will never show--');

// Custom validator for JSON (passed as form-data, potentially not wellformed JSON)
Validator.register('json', function(value, requirement, attribute) {
	return toJSON(value, false);
}, 'The :attribute is not a JSON object');


/// based on http://stackoverflow.com/a/26291352
/// gist: https://gist.github.com/baseio/e2cee1a8cb87bf09402717b80130bb93
function toJSON(str, returnTheJSON) {

	try {
		var j = JSON.parse( str );
		//console.log("> toJSON 1 OK ", j);
		return returnTheJSON ? j : true;
	}catch(e){
		//console.log("> toJSON 1 ERROR - proceeding", e);
	}

	/// based on http://stackoverflow.com/a/26291352
	var s = str
		.replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":'}) // wrap keys without quote with valid double quote
		.replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"'}); 	// replacing single quote wrapped ones to double quote 

	//console.log("> toJSON s", s);

	try {
		var j = JSON.parse( s );
		//console.log("> toJSON 2 OK ", j);
		return returnTheJSON ? j : true;
	}catch(e){
		//console.log("> toJSON 2 ERROR - final", e);
		return returnTheJSON ? {} : false;
	}
}

console.dir( toJSON('{a:1, b:"hallo", c:[1,2,3]}', true), {colorize:true} );
console.dir( toJSON('{a:1, b:"hallo", c:[1,2,3], d:{e:1,f:{g:2}}}', true), {colorize:true} );

//'{a:1, b:"hallo", c:[1,2,3]}'
// {a:1, b:"hallo", c:[1,2,3], d:{e:1,f:{g:2}}}


module.exports = function(rules, cb){
	
	var data = {};
	var ruleKeys = Object.keys(rules);
	ruleKeys.map( (key) => {
		data[ key ] = this.args[ key ];

		console.log( key, rules[key], rules[key].indexOf('json') );
	});

	var validation = new Validator(data, rules);

	if( validation.passes() ){

		// return the data with type conversion present
		data = {};
		ruleKeys.map( (key) => {
			if(this.args[ key ]){

				if( rules[key].indexOf('json') > -1 ){
					data[ key ] = toJSON(this.args[ key ], true);
				
				}else if( rules[key].indexOf('numeric') > -1 ){
					data[ key ] = Number(this.args[ key ]);
				
				}else if( rules[key].indexOf('slug') > -1 ){
					data[ key ] = slug(this.args[ key ]);

				}else{
					data[ key ] = this.args[ key ];
				}
			}
		});
		cb(data);

	}else{

		console.log("@expect, validation error:",  validation.errorCount, validation.errors.all() );
		/*
		{ 
		  text: [ 'The text field is required.' ],
  		  title: [ 'The title field is required.' ]
  		}
		*/
		let keys = Object.keys( validation.errors.all() );
		let msg  = "Validation Error" + ( validation.errorCount > 1 ? 's' : '');
		let errs = [];
		Object.keys( validation.errors.all() ).map( (key) => {
			let errors_array = validation.errors.get(key);
			errs.push( errors_array.join(", ") );
		});

		this.send({ok:false, message:msg, errors:errs});
	}
}
