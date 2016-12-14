(api) => {

    //console.dir(this, {colors:true});
    console.log("This:");
    console.dir( Object.keys(this), {colors:true});

    console.log("Process:");
    console.dir( Object.keys(process), {colors:true});

    
    
    //console.dir(arguments, {colors:true});
    
    //console.dir(api, {colors:true});

    console.log("api:");
    console.dir( Object.keys(api).sort(), {colors:true});

    api.send({ok:true});
}