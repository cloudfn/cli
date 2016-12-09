(api) => {
	
	/*

	beta-list signup 

	POST > add:
		- name
		- email
		< return:
			voucher
			list position

	GET > returns count

	*/
    console.log("api.args:");
    console.dir(api.args, {colors:true});

    var signup_html = `<!DOCTYPE html>
<html>
<head>
	<title>signup fetch</title>
	<meta charset="utf-8">

</head>
<body>

<form id="signup-form">
	<input type="text" name="email" value="js@base.io">
	<input type="button" value="signup" onclick="signup()">
</form>

<script type="text/javascript">

function signup(){
	console.log("signup()");

	fetch("https://cloudfn.stream/cfn/signup", {
		method:'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: 'sth@base.io'
		})
	})
	.then( function(response){
		console.log("resp:", response);
		return response.text();
	})
	.then( function(text){
		console.log("text:", text);
	})
	.catch( function(err){
		console.log("err:", err);
	});
}

</script>

</body>
</html>`;


	//api.auth({origins:['https://cloudfn.github.io/website/']}, () => {


		if( api.method === 'POST' ){
			console.log("GOT POST");
			api.send({ok:true, msg:"hello POST", args: api.args});
		}

		if( api.method === 'GET' ){
			console.log("GOT GET");
			api.send( signup_html );
		}

	//});

}
