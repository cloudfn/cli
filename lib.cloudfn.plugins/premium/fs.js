/// General note on (all) Plugins:
/// The execution context is bound to the same api-object as made available to the (calling) script.

var fs = require('fs');
var path = require('path');

const FSModule = {

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
		console.log("@prem.fs write:", "file:", file, "data:", data);
		let safeFile = this.getSafePath(file);
		console.log("@prem.fs write safeFile:", safeFile);
		let err = false;
		console.log("@prem.fs write:", file, ' > ', safeFile, "data:", data );

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

