(api) => {

	const square = (int) => int * int;
	
	console.log( "Square of 6 is ", square(6) );
	api.send({ok:true, squareOf6:square(6)});
}

