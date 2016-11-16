
var path    = require('path');
var fs      = require('fs');
var tmp     = require('tmp');

var run     = require('./runner');
var logger  = require('./logger');
var sandbox = require('./sandbox');

module.exports = function( scriptfile, cb ){

    var file = path.normalize(scriptfile);
    var info = path.parse(file);
    var err  = false;

    if( !is_readable(file) ){
        logger.error(501, "Cant read file", file);
        //return cb(true, null);
        return verified(true, info, file, cb);
    }

    if( info.ext !== '.js' ){
        logger.error(502, "Only '.js' files accepted.", "(Got "+ info.ext +")");
        //return cb(true, null);
        return verified(true, info, file, cb);
    }

    let clientCode = null;
    let code = fs.readFileSync(file).toString();

    //console.log("IN", code);

    /// Prepend sanboxing code
    code  = [
        'return (api) => {',
        '    arguments = api.clean.call(this);',
        //'    require("'+ __dirname +'/norequire.js")();',
        //'    var Module = require("module"); Module._load = function(request, parent){ return; };',
        '    // sandbox end',
        ''
    ].join("\n") +'    //'+ code.trim();

    //console.log("OUT", code);

    /// Check compilation
    try {
        let factory = new Function('require', code);
        clientCode = factory(require);

        //console.log('clientCode', clientCode.length, clientCode);
        
        if (typeof clientCode !== 'function') {
            logger.error(510, 'The code does not return a JavaScript function.');
            //return cb(true, null);
            return verified(true, info, file, cb);
        }

    } catch (e) {
        logger.error(511, 'Unable to compile script:', e.toString());
        //return cb(true, null);
        return verified(true, info, file, cb);
    }

    /// Check Execution
    try {

        var tmpname = tmp.tmpNameSync();
        fs.writeFileSync(tmpname, code);

        //run.code(clientCode, {});
        run.file(tmpname, {b:2});

    }catch (e) {

        //console.log("## POST RUN with ERROR");
        //sandbox.restore();

        logger.error(512, 'Unable to execute script:', e.toString());

        if( e.stack.indexOf('at require (') > 0){
            logger.hint(512, 'Use of require() is not allowed for security reasons.', 'See https://docs.cloudfn.stream/#api for possible workarounds');
        }

        //return cb(true, null);
        return verified(true, info, file, cb);
    }

    //console.log("## POST RUN without ERROR");
    //sandbox.restore();
    verified(false, info, file, cb);

    //cb(false, code, info);
}


function verified(err, info, scriptfile, cb){
    sandbox.restore();

    if( err ){
        logger.error(520, 'Verification failed', scriptfile);
    }else{
        logger.ok("Verified", scriptfile);
    }
    return cb(err, info, scriptfile);
}


function is_readable(file){
    try {
        fs.accessSync(file, 'r');
        return true;
    }catch(e){
        return false;
    }
}
