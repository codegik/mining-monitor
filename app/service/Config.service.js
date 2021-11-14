const configRepository = require('../repository/Config.repository');


var getConfig = function (callback) {
  configRepository.findOne(callback);
};

var save = function (config, callback) {
  configRepository.save(config, callback);
};

exports.getConfig = getConfig;
exports.save = save;
