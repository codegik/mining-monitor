const package = require('../../package.json');

exports.getVersion = function(req, res) {
  return res.json(package.version);
};
