/// General note on (all) Plugins:
/// The execution context is bound to the same api-object as made available to the (calling) script.

var fs = require('fs');
var path = require('path');

const FSModule = {

	test: function(){
		console.log("---------- @prem.fs test", this.root);
    	//console.dir(this, {colors:true});
    	console.dir(this.fs, {colors:true});
	},

	read: function(file, cb){
		console.log("@prem.fs read:", file);
		let safeFile = this.getSafePath(file);

		console.log("@prem.fs read:", file, ' > ', safeFile );

		try{
			var str = fs.readFileSync(safeFile).toString();

			// decode based on ext (json)
			var info = path.parse(safeFile);
			if( info.ext === '.json' ){
				cb(null, JSON.parse(str) );
			}else{
				cb(null, str);
			}

		}catch(e){
			cb(true,null);
		}
	},

	write: function(file, data, cb){
		console.log("@prem.fs write:", file, data);
		console.log("@prem.fs write:", this);
		let safeFile = this.getSafePath(file);
		let err = false;
		console.log("@prem.fs write:", file, ' > ', safeFile, data );

		try{
			fs.writeFileSync(safeFile, data);
		}catch(e){
			console.log("@prem.fs write Error:", e);
			err = true;
		}

		if( err ){
			cb(true, 'WRITE_FILE_ERROR');
		}else{
			cb(false, 'WRITE_FILE_SUCCESS');
		}
	},

	list: function(dir, cb){
		console.log("@prem.fs list:", dir);
		let safeFile = this.getSafePath(dir);
		console.log("@prem.fs list:", safeFile);


		let ignore = ['index.js', 'store.json'];
		var list = fs.readdirSync(safeFile).filter( val => ignore.indexOf(val) < 0 );
		console.log(list);
		/// ignore the system files: index.js and store.json
		cb(true, list);
	}
}

module.exports = FSModule;

