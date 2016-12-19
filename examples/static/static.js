(api) => {
 
 	// demo: https://cloudfn.github.io/website/jsonp.html

	// only allow requests from this origins
	api.auth({origins:['*://cloudfn.net/examples/static/*']}, () => {
	
		// init if needed
	    api.store.data['counter'] = api.store.data['counter'] || 1;

	    // increment
	    api.store.data['counter'] = api.store.data['counter'] +1;

	   	// echo
	    api.send({counter: api.store.data['counter']});

	    // persist
	    api.store.save();

	});
}