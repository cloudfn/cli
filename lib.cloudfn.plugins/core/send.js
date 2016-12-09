
module.exports = function(data){

	//console.log("@send() ", this, data);
	//console.log("@send() ", this.args);

	// obey return format from url-query
	if( this.args.query.callback ){

		console.log("@core.send", "sending jsonp");
		this.res.set('Content-Type', 'text/javascript');
		this.res.send( this.args.query.callback +'('+ JSON.stringify(data) +');');

	}else{

		if( typeof data === 'string' ){
			this.res.send(data);
			this.res.end();
		}else{
			this.res.json(data);
		}

	}
}
