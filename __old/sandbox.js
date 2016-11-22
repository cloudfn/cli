
var Module = require("module");
var original_load = Module._load;



module.exports.clean = function(){

    var keep_process = ['nextTick', '_tickCallback', 'stdout', 'console', 'hrtime'];
    var keep_this = ['console', 'process'];
    Object.keys(this.process).map( (key) => {
        if( keep_process.indexOf(key) < 0 ) delete this.process[key];
    });
    Object.keys(this).map( (key) => {
        if( keep_this.indexOf(key) < 0 ) delete this[key];
    });
    //console.dir(this, {colors:true});
    //console.dir(arguments, {colors:true});
    Module._load = load_disabled;

    return [];
}

module.exports.restore = function(){
    console.log("* RESTORE");
    Module._load = load_enabled;
}

function load_disabled(request, parent){
    //console.log("Module.load - load_disabled -");
    return;
}

function load_enabled(request, parent){
    console.log("Module.load - load_enabled -");
    return original_load(request, parent);
}