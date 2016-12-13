(api) => {

    if( !api.args.day ){
        api.send({ok:false, msg:"param: 'day' required."});
        return;
    }

    if( !api.args.session ){
        api.send({ok:false, msg:"param: 'session' required."});
        return;
    }
    
    // call like 
    // https://cloudfn.stream/examples/adventofcode?day=10&session=<session_id>
    // where:
    // $day is the puzzle-day you want 
    // $session_id is your logg'ed in session (steal it from the browser after logging into http://adventofcode.com)
    //   it looks sth like this: 53616c7465645f5fxf1bf6f317xbdd7xc8ecae89f54becfb9b036270da2a916a8cf945b951ef5c316bd6e9923c3fed8a


    var url = 'http://adventofcode.com/2016/day/' + api.args.day + '/input';
    var id = api.args.session;


    api.request({url: url, cookie:{'session':id}}, (body) => {
        console.log("body", body);
        api.send(body);
    });
    
}