(api) => {
 
    // init if needed
    api.store.data['scores'] = api.store.data['scores'] || {};

    // capture
    let username = api.args.username  || false;
    let score    = api.args.score     || false;

    // debug
    //api.send({"username": username, "score": score, "method": api.method}); return;

    // early out (cant proceed without a username)
    if( username === false ){
        api.send({ok:false, msg:"param: 'username' required"});
        return;
    }

    if( api.method === 'POST' ){

        // make sure score is provided
        if( score === false ){
            api.send({ok:false, msg:"param: 'score' required"});
            return;
        }

        // insert or update
        api.store.data['scores'][ username ] = score;

        // persist
        api.store.save();
    }

    // respond
    let record = api.store.data['scores'][ username ];
    api.send({ok:true, msg:'RECORD', record:record});
}
