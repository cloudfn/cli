(api) => {

	/// Example of using the api.args

    console.log("examples/echo:");
    console.dir(api.args, {colors:true});

    let message = api.args.query.msg || api.args.params.msg;

    api.send({ok:true, msg:message})
}