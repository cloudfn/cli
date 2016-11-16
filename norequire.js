var Module = require('module');

Module._load = function(request, parent) {
  //console.log("Module._load aborted");
  return;
};
module.exports = function(){};
/*
module.exports.stop = stopMocking;
module.exports.stopAll = stopMockingAll;
module.exports.reRequire = reRequire;
*/