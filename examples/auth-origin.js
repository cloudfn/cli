(api) => {

	/// Example of using the api.auth.keys feature
	/// Provide the valid keys, and wrap your code in its callback.

	api.auth({origins:['*://cloudfn.github.io/*']}, () => {
		
		/// your code here

		api.send({message:"This is only printed if authenticated"});
	});
}

// cli usage:
// $ cfn test examples/auth-origin.js origin=https://cloudfn.github.io/websi

// or, to check failure:
// $ cfn test examples/auth-origin.js origin=https://cloudfn.github.com
