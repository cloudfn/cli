(api) => {

	let mode = api.args.query.mode || 'valid';
	
	console.log("-- request with mode:", mode, "method:", api.method);

	var url = (mode == 'valid')
				? 'https://httpbin.org'			// known to work
				: 'http://212.55.62.160/junk';	// known to fail

	var opts = {
		method: api.method,
		uri: url + '/' + api.method.toLowerCase()
	}

	api.request(opts, (body) => {
		console.log("body", body);
		api.send(body);
	});
}