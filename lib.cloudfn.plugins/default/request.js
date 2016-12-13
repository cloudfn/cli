
const USER_SOCKET_TIMEOUT = 2000;

const request = require('request').defaults({timeout:USER_SOCKET_TIMEOUT});

/*
module.exports.jar = module_request.jar;
module.exports.cookie = module_request.cookie;
module.exports.raw_request = module_request;
*/
module.exports = function(opts, cb){

	if( opts.cookie ){
		console.log("Setting cookie");
		var j = request.jar();
    	var cookie = request.cookie('session=53616c7465645f5fef1bf6f317fbdd76c8ecae89f54becfb9b036270da2a916a8cf945b951ef5c316bd6e9923c3fed8a');
    	j.setCookie(cookie, opts.url);
    	opts.jar = j;
	}
	
	request.call(this, opts, (err, response, body) => {
		let url = opts.url || opts.uri || opts;
		console.log("@plugins.default.request url", url);
		
		//console.log(err, response, body);
		//console.log("ETIMEDOUT?", (err.code === 'ETIMEDOUT') );
		//console.log('## body: ' + body);
		
		if( err ){
			if(err.code === 'ETIMEDOUT'){
				if(err.connect === true){
					cb({ok:false, msg:'SOCKET RESPONSE TIMEOUT', url:url, timeout:USER_SOCKET_TIMEOUT});
				}else{
					cb({ok:false, msg:'SOCKET CONNECT TIMEOUT', url:url, timeout:USER_SOCKET_TIMEOUT});
				}
			}else{
				cb({ok:false, msg:err, url:url, timeout:USER_SOCKET_TIMEOUT});
			}

			this._next();

		}else{
			cb(body);
		}
	});
}

