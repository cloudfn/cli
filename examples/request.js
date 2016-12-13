(api) => {


	console.log("-- request with mode:", api.args.mode, "method:", api.method);

	var url = '';

	if( api.args.mode == 'FAST' ){
		url = 'https://cloudfn.stream/id';

	}else if( api.args.mode == 'LOCAL' ){
		url = 'http://localhost:3033/id';

	}else if( api.args.mode == 'FORCE_FAIL' ){
		url = 'http://212.55.62.160/junk'; // known to fail
	
	}else{
		url = 'https://httpbin.org/'+ api.method.toLowerCase();
	}


	var opts = {
		method: api.method,
		uri: url
	}

	api.request(opts, (body) => {
		console.log("body", typeof(body), body);
		if( typeof body === 'string' ) body = JSON.parse(body); // httpbin.org returns data as string, not json
		
		api.send(body);
	});
}