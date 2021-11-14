const log = require('./helper/Log.helper');
const configService = require('./service/Config.service');
const path = require('path');
const s9minerController = require('./controller/S9miner.controller');
const configController = require('./controller/Config.controller');
const warehouseController = require('./controller/Warehouse.controller');
const restService = require('./service/Rest.service');
const ipReportService = require('./service/IPReporter.service');


configService.getConfig(config => {
  const socketIo = require('socket.io')(config.PORT);

  require('dotenv').config({
    path: path.join(__dirname, '.env')
  });

  socketIo.on('connect', socket => {
    log.debug('client connected ' + socket.client.conn.remoteAddress);
    s9minerController.listening(socket);
    configController.listening(socket);
    warehouseController.listening(socket);
  });

  restService.init(config);
  ipReportService.init(config);
  s9minerController.init(config, socketIo);
});
