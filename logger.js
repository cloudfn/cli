const chalk = require('chalk');

module.exports.log = function(code, msg, rest){
	code = code || 0;
	rest = rest || '';
	console.log( chalk.blue('['+ code +']'), msg, chalk.grey(rest) );
}

module.exports.error = function(code, msg, rest){
	code = code || 0;
	rest = rest || '';
	console.log( chalk.red('['+ code +'] ERROR:', msg), chalk.grey(rest));
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
