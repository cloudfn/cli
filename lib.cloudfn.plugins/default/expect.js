

var Validator = require('./expect-validator-dist.js');
/// https://github.com/skaterdav85/validatorjs
/// we're using the version from it's dist folder,
/// copied relative to this script,
/// because the normal node_modules version uses require(),
/// and that has been disabled by the sandbox...

Validator.register('json', function(value, requirement, attribute) {
	console.log("@expect validate json:", value, requirement, attribute);
	return true;
    //return value.match(/^\d{3}-\d{3}-\d{4}$/);
}, 'The :attribute phone number is not in the format XXX-XXX-XXXX.');



module.exports = function(rules, cb){
	
	var data = {};
	Object.keys(rules).map( (key) => {
		data[ key ] = this.args[ key ];
	});

	var validation = new Validator(data, rules);

	if( validation.passes() ){
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
	
	/*
	validation.passes(cb(data););
	
	validation.fails( () => {
		console.log("@expect, validation error:",  validation.errorCount, validation.errors.all() );
		
		// { 
		//   text: [ 'The text field is required.' ],
  		//   title: [ 'The title field is required.' ]
  		// }
		
		let keys = Object.keys( validation.errors.all() );
		let msg  = "Validation Error" + ( validation.errorCount > 1 ? 's' : '');
		let errs = [];
		Object.keys( validation.errors.all() ).map( (key) => {
			let errors_array = validation.errors.get(key);
			errs.push( errors_array.join(", ") );
		});

		this.send({ok:false, message:msg, errors:errs});
	});
	*/
}

