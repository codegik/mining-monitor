const log = require('../helper/Log.helper');
const configService = require('../service/Config.service');


var listening = function (socket) {

  // on config page is loaded
  socket.on('onConfig', () => {
    configService.getConfig(config => {
      socket.emit('getConfig', config);
    });
  });

  // getConfig command request
  socket.on('getConfig', () => {
    configService.getConfig(config => {
      socket.broadcast.emit('getConfig', config);
    });
  });

  // save command request
  socket.on('saveConfig', config => {
    log.debug('saveConfig ' + JSON.stringify(config));
    if (config) {
      configService.save(config, res => {
        socket.emit('onSaveConfig', {
          success: true
        });
        configService.getConfig(config => {
          socket.broadcast.emit('getConfig', config);
        });
      });
    }
  });
};


exports.listening = listening;
