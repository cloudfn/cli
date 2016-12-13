
const USER_SOCKET_TIMEOUT = 2000;

const module_request = require('request').defaults({timeout:USER_SOCKET_TIMEOUT});



module.exports = function(opts, cb){
	
	module_request.call(this, opts, (err, response, body) => {
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

			this.next();

		}else{
			cb(body);
		}
	});
}

