(api) => {
	
	console.log("-- scriptdata");

	/// Shows how url-parameters, query-string and form-fields are all combined into api.data 

	console.log( "args", api.args );

	api.send({ok:true, data:api.args });
}