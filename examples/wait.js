(api) => {

	// TODO: disable USER_SCRIPT_LIFETIME kill() when wait() is in progress (up to a certain max?)	

	console.log("-- wait");
	
	api.wait( () => {
		console.log("-- done waiting");
		api.send("done waiting");
	//	api.next();
	}, 1000 );
	
}
	