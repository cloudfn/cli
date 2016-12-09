(api) => {
	
	console.log( "Square of 6 is ", square(6) );
	api.send({ok:true, squareOf6:square(6)});
}

// this DOES NOT work - wonder why
// prints ReferenceError: square is not defined
const square = (int) => int * int;