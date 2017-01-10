(api) => {
	// auth
	if( api.auth({token:'inc-test'}), () => {

		// init
		api.store.value = api.store.value || 0;

		// action: set
		if( api.args.action === 'write' && parseInt(api.store.value) ){
			api.store.value = parseInt(api.args.value);


			// publish

			// ws://cloudfn.stream/examples/ws-inc
			api.pub({chn:'inc', msg:{val:api.store.value}));
		}

		// action: get
		if( api.args.action === 'get' ){
			// GET https://cloudfn.stream/examples/ws-inc?action=read
			api.send({val:api.store.value});
		}

		// action: increment
		if( api.args.action === 'increment' ){
			// GET https://cloudfn.stream/examples/ws-inc?action=increment
			api.store.value = parseInt(api.store.value) + 1;
			api.send({val:api.store.value});
		}

	});
}