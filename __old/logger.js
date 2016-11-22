const chalk = require('chalk');
const path  = require('path');
const fs    = require('fs');

const afile = path.join( __dirname, 'logs', 'access.log' );
const efile = path.join( __dirname, 'logs', 'error.log' );

module.exports.access = function(msg){
	//TODO: Align with some common logfile format
	fs.appendFile(afile, msg);
}

module.exports.log = function(code, msg, rest){
	code = code || 0;
	rest = rest || '';
	console.log( chalk.blue('['+ code +']'), msg, chalk.grey(rest) );
}

module.exports.error = function(code, msg, rest){
	code = code || 0;
	rest = rest || '';
	console.log( chalk.red('['+ code +'] ERROR:', msg), chalk.grey(rest));

	fs.appendFile(efile, code +';'+ msg);
}

module.exports.warn = function(code, msg, rest){
	code = code || 0;
	rest = rest || '';
	console.log( chalk.yellow('['+ code +'] WARNING:'), msg, chalk.grey(rest));
}

module.exports.hint = function(code, msg, rest){
	code = code || 0;
	rest = rest || '';
	console.log( chalk.blue('['+ code +'] HINT:'), msg, rest);
}

module.exports.ok = function(msg, rest){
	rest = rest || '';
	console.log( chalk.green(msg), rest);
}
