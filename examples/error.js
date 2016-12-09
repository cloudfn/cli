(api) => {

	console.log("\nLet me generate an error... hold on:");

	api.send({ok:false, note:"this is a forced error", msg:(a+b)});

}