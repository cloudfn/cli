(api) => {

	/// Example of using the api.auth.keys feature
	/// Provide the valid keys, and wrap your code in its callback.

	api.auth({keys:['AABBCC']}, () => {
		
		/// your code here

		api.send({ok:true, msg:"Access allowed!"});
	});
}

// cli usage:
// $ cfn test examples/auth-token.js {Auth:aa}
// or, to check failure:
// $ cfn test examples/auth-token.js {Auth:bb}
