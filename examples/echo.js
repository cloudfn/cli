(api) => {

	// call this script with either
	// query string: "?msg=hello" in the url
	// or url params, "/msg/hallo"
	
    api.send({ok:true, msg:api.args.msg})
}