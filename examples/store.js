(api) => {

    /// Example of using the api.store; a key-value store that is persisted to disk

    console.log("@examples.store:");
    console.dir(api.store, {colors:true});

    /// Harvest vars from the script arguments:
    let user  = api.args.query.user  || api.args.params.user;
    let score = api.args.query.score || api.args.params.score;

    /// Read or init the 'users' object
    api.store.data['users'] = api.store.data['users'] || {};

    /// GET or POST?
    console.log("user:", user, "score", score, "method:", api.method);

    if( api.method === 'GET' ){
        let record = {};
        record[user] = api.store.data['users'][ user ];
        api.send({ok:true, msg:'GET_RECORD', record:record});
    }

    //if( score === undefined ){
        /// The script was called without a score argument, treat this as 
    //}
    
    if( api.method === 'POST' ){
        /// Set or update the user's score
        api.store.data['users'][ user ] = score;

        /// Save to disk
        api.store.save();

        /// Respond
        let record = {};
        record[user] = score;
        api.send({ok:true, msg:'SET_RECORD', record:record});
    }
}

// Call like
// GET localhost:3033/examples/store?user=js > get record for js
// or 
// POST localhost:3033/examples/store?user=js&score=567 > set record for js