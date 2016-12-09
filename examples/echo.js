(api) => {

	// grab the message from either query or params
	// e.g, for query, call this script with "?msg=hello" in the url
	// or, for params, call this script with "/msg/hallo" at the end of the url
	
    let message = api.args.query.msg || api.args.params.msg;

    api.send({ok:true, msg:message})
}