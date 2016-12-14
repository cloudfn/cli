(api) => {

	/// Example of using the api.auth.origins feature
	/// Provide the valid origins (hostnames, urls...), and wrap your code in its callback.

	//api.auth({origins:['*://cloudfn.github.io/*']}, () => {
	api.auth({origins:['localhost']}, () => {
		
		/// your code here

		api.send({ok:true, msg:"Access allowed!"});
	});
}
