(api) => {

	/// Prints script context

	console.log("this");
    console.dir(this, {colors:true});

    console.log("arguments");
    console.dir(arguments, {colors:true});

    console.log("CloudFn API:");
    console.dir(api, {colors:true});

    console.log("CloudFn api.args:");
    console.dir(api.args, {colors:true});

    console.log("Process.env:");
    console.dir(process.env, {colors:true});

}