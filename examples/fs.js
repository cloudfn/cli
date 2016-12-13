(api) => {
	console.log("-- fs example --");
    console.dir(api.args, {colors:true});

    if( api.method === 'GET' ){

        if( api.args.file ){

            // read the file

            api.fs.read(api.args.file, (err, data) => {
                console.log( "-- fs read result:", err, data);
                if(err){
                    api.send({ok:false, msg:data});
                }else{
                    api.send({ok:true, msg:data});
                }
            });

        }else{

            // list available files
            api.fs.list('', (err, data) => {
                console.log( "-- fs list result:", err, data);
                api.send({ok:true, msg:data});
            });
        }
    }

    if( api.method === 'POST' ){
        
        api.fs.write( api.args.file, api.args.data, (err, data) => {
        	console.log( "-- fs write result:", err, data);
            if(err){
                api.send({ok:false, msg:data});
            }else{
                api.send({ok:true, msg:data});
            }
        });
     }

}