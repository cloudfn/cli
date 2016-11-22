(api) => {

	/// Example of using the api.store

    console.log("@1 CloudFn api.store:");
    console.dir(api.store, {colors:true});

    api.store['users'] = api.store['users'] || {};
    api.store['users'][ api.args.username ] = api.args.score;

    console.log("@2 CloudFn api.store:");
    console.dir(api.store, {colors:true});

}