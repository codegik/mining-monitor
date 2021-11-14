const log = require('../helper/Log.helper');
const warehouseService = require('../service/Warehouse.service');


var listening = function (socket) {

  // on warehouse page is loaded
  socket.on('onWarehouse', () => {
    warehouseService.findAll(warehouseList => {
      socket.emit('getWarehouseList', warehouseList);
    });
  });

  // save command request
  socket.on('saveWarehouse', warehouse => {
    log.debug('saveWarehouse ' + JSON.stringify(warehouse));
    if (warehouse) {
      warehouseService.insert(warehouse, res => {
        socket.emit('onSaveWarehouse', {
          success: true
        });
        warehouseService.findAll(warehouseList => {
          socket.emit('getWarehouseList', warehouseList);
        });
      });
    }
  });
};


exports.listening = listening;
