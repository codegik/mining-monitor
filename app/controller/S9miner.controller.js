const log = require('../helper/Log.helper');
const exec = require('child_process').exec;
const s9minerService = require('../service/S9miner.service');
const s9MinerRepository = require('../repository/S9miner.repository');
const placeRepository = require('../repository/Place.repository');
const constants = require('../constants');


var init = function (config, socketIo) {
  log.debug('Websocket service started on port ' + config.PORT);
  s9minerService.createMQ();
  s9minerService.refreshData(socketIo);
  s9minerService.updateHistory(config);
};

var updateUIInterval = null;

var listening = function (socket) {
  var updateUI = (filters, socket) => {
    s9MinerRepository.findAllByParams(filters, miners => {
      placeRepository.getMap(places => {
        socket.emit('getMiners', miners);
        socket.emit('getMapPlaces', places);
        socket.emit('getIndicators', s9minerService.getIndicators(miners, places));
      });
    });
  };

  // on dashboard page is loaded
  socket.on('onDashboard', (filters) => {
    clearInterval(updateUIInterval);
    updateUI(filters, socket);
    updateUIInterval = setInterval(() => {
      updateUI(filters, socket);
    }, 30 * 1000);
  });


  // shutdown command request
  socket.on('shutdown', (miner) => {
    log.debug('shutting down ' + miner.network.ip + ' ' + miner.network.macaddress);
    if (miner.network.ip) {
      exec("/bin/sh ./app/service/shutdown.sh " + miner.network.ip, function (error, stdout, stderr) {
        if (error !== null) {
          log.debug('exec error: ' + error);
          socket.emit('onShutdown', {
            success: false,
            error: error
          });
        } else {
          socket.emit('onShutdown', {
            success: true
          });
          s9minerService.updateAlert(miner.network.ip, constants.USER_SHUTDOWN, res => {
            s9MinerRepository.findAll(miners => {
              socket.emit('getMiners', miners);
              socket.broadcast.emit('getMiners', miners);
            });
          });
        }
      });
    }
  });

  // reboot command request
  socket.on('reboot', (miner) => {
    log.debug('rebooting ' + miner.network.ip + ' ' + miner.network.macaddress);
    if (miner.network.ip) {
      exec("/bin/sh ./app/service/reboot.sh " + miner.network.ip, function (error, stdout, stderr) {
        if (error !== null) {
          log.debug('exec error: ' + error);
          socket.emit('onReboot', {
            success: false,
            error: error
          });
        } else {
          socket.emit('onReboot', {
            success: true
          });
          s9minerService.updateAlert(miner.network.ip, constants.USER_REBOOT, res => {
            s9MinerRepository.findAll(miners => {
              socket.emit('getMiners', miners);
              socket.broadcast.emit('getMiners', miners);
            });
          });
        }
      });
    }
  });

  // edit command request
  socket.on('savePlace', (place) => {
    log.debug('savePlace ' + JSON.stringify(place));
    if (place.macaddress) {
      placeRepository.save(place, res => {
        socket.emit('onSavePlace', {
          success: true
        });
        placeRepository.getMap(places => {
          socket.emit('getMapPlaces', places);
          socket.broadcast.emit('getMapPlaces', places);
        });
      });
    }
  });
};

exports.listening = listening;
exports.init = init;
