return (context, req, res, next) => {
    
    let username = req.query.username   || "";
    let score 	 = req.query.score 		|| 0;

    context.store.highscores = context.store.highscores || {};
    
    if( context.store.highscores[username] ){
    	context.store.highscores[username].score = score;
    	context.store.highscores[username].updatedAt = Date.now();
    }else{
    	context.store.highscores[username] = {
    		score: 0,
    		createdAt: Date.now()
    	}
    }

	console.log('chighscores:', context.store.highscores );
    res.json({result: context.store.highscores[username]});
    next();
}