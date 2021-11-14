const warehouseRepository = require('../repository/Warehouse.repository');
const warehouseStatisticRepository = require('../repository/WarehouseStatistic.repository');
const s9MinerRepository = require('../repository/S9miner.repository');
const placeRepository = require('../repository/Place.repository');
const s9minerService = require('../service/S9miner.service');


var insert = function (warehouse, callback) {
  var count = 0;
  var size = warehouse.indicators.length;
  placeRepository.getMap(places => {
    warehouse.indicators.map(indicator => {
      s9MinerRepository.findAllByParams({
        user: indicator.user
      }, miners => {
        count++;
        indicator.statistic = s9minerService.getIndicators(miners, places);
        if (count == size) {
          warehouseRepository.insert(warehouse, result => {
            warehouseStatisticRepository.insert(result, result2 => {
              if (callback) {
                callback(result);
              }
            });
          });
        }
      });
    });
  });
};

var findAll = function (callback) {
  warehouseRepository.findAll(callback);
};

exports.insert = insert;
exports.findAll = findAll;
