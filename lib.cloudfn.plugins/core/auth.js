module.exports = function(opts, cb){
	//console.log("@core.auth opts:", opts);
	//console.log("@core.auth args:", this.args);

	let key = this.args.key || this.args.key || '';

	if( opts.keys ){
		console.log("@core.auth>key:", opts.keys, opts.keys.indexOf(key));

		if( opts.keys.indexOf(key) > -1 ){
			cb();
		}else{
			this.send({ok:false, message:"access denied (keys)"});
		}

	}else if( opts.origins ){
		console.log("@core.auth>origin:", opts.origins, this.args.origin );

		let allow = false;
		if( typeof opts.origins === 'string' ){ // single rule
			allow = is_match(this.args.origin, opts.origins);
		
		}else if( typeof opts.origins === 'object'){ // multiple rules (array)
			for(let i=0, len=opts.origins.length; i<len; i++){
				let test = is_match(this.args.origin, opts.origins[i]);
				if( test ) allow = true;
			}
		}
		
		if( allow ){
			cb();
		}else{
			this.send({ok:false, message:"access denied (origin)"});
		}

	}else{
		this.send({ok:false, message:"access denied (configuration)"});
	}
}

function is_match(str, rule){
	// http://stackoverflow.com/a/32402438
	return res = new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
}