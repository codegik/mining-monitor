const log = require('../helper/Log.helper');
const env = require('../environments');
const emailService = require('./Email.service');
const placeRepository = require('../repository/Place.repository');
const s9MinerRepository = require('../repository/S9miner.repository');
const s9MinerHistoryRepository = require('../repository/S9minerHistory.repository');
const indicatorRepository = require('../repository/Indicator.repository');
const indicatorStatistic = require('../repository/IndicatorStatistic.repository');
const alertStatistic = require('../repository/AlertStatistic.repository');
const indicatorHistoryRepository = require('../repository/IndicatorHistory.repository');
const assert = require('assert');
const amqp = require('amqplib/callback_api');

var logLevel = [
  "",
  "INFO",
  "WARNING",
  "DANGER"
];
var parameters = null;

// refresh all data
exports.refreshData = function (socket) {
  var scheduledUpdate = function (socket) {
    // find all miners
    s9MinerRepository.findAll(miners => {
      log.debug("refreshing data: " + miners.length + " founded ");
      placeRepository.getMap(places => {
        var indicators = exports.getIndicators(miners, places);
        // save current indicators
        if (miners.length > 0) {
          indicatorRepository.insertOrReplace(indicators, result => {
            indicatorStatistic.insert(result);
          });
        }
        // check offline miner
        exports.checkInactive();
      });
    });
  };
  // wait and restart function
  setInterval(function () {
    scheduledUpdate(socket);
  }, 30 * 1000);
};

// update history
exports.updateHistory = function (config) {
  parameters = config;
  var scheduledHistory = function (config) {
    s9MinerRepository.findAll(miners => {
      log.debug("updating history: " + miners.length + " founded");
      placeRepository.getMap(places => {
        var indicators = exports.getIndicators(miners, places);
        if (miners.length > 0) {
          indicatorHistoryRepository.insertAll([indicators]);
          s9MinerHistoryRepository.insertAll(miners);
          // check miner alerts
          exports.checkAlerts(miners);
        }
      });
    });
  };
  // wait and restart function
  setInterval(function () {
    scheduledHistory(config);
  }, 1000 * 30 * parseInt(config.database_history_interval));
};

exports.checkInactive = function () {
  var date = new Date(new Date().getTime() - 180000); // 3 minutes
  s9MinerRepository.deleteByOldDateCreated(date, deletedMiners => {
    deletedMiners.map(miner => {
      log.debug("deleted inactive " + miner.network.ip + " " + miner.network.macaddress);
    });
  });
};

exports.updateAlert = function (ip, text, callback) {
  s9MinerRepository.updateAlert(ip, text, result => {
    alertStatistic.insert({
      ip: ip,
      alert: text
    }, res => {
      if (callback) {
        callback(result);
      }
    });
  })
}


exports.getIndicators = function (miners, places) {
  var indicators = {
    scannedDate: new Date(),
    s9UnknownLocation: 0,
    s9Total: miners.length,
    s9TotalDanger: 0,
    s9TotalWarning: 0,
    s9TotalInfo: 0,
    s9TotalNormal: 0,
    s9TotalHashboardIssue: 0,
    s9TotalHashes: 0,
    s9TotalHashesLabel: "0 PH/s"
  };

  for (var miner of miners) {
    try {
      if (!places || (places && !places[miner.network.macaddress])) {
        indicators.s9UnknownLocation++;
      }

      indicators.s9TotalHashes += parseFloat(miner.summary["GHS av"]);
      indicators.s9TotalHashesLabel = (indicators.s9TotalHashes / 1000 / 1000).toFixed(3) + " PH/s";

      var alertCount = exports.countTemperatureAlert(miner.temperature);

      if (alertCount == 3) {
        indicators.s9TotalDanger++;
      } else if (alertCount == 2) {
        indicators.s9TotalWarning++;
      } else if (alertCount == 1) {
        indicators.s9TotalInfo++;
      } else {
        indicators.s9TotalNormal++;
      }

      if (exports.countHashboardIssue(miner.temperature) > 0) {
        indicators.s9TotalHashboardIssue++;
      }
    } catch (err) {
      log.debug(err);
    }
  }

  return indicators;
};

exports.checkAlerts = function (miners) {
  var textDetails = [];
  for (var miner of miners) {
    var alertCount = exports.countTemperatureAlert(miner.temperature);

    if (alertCount > 2) {
      textDetails.push('[' + logLevel[alertCount] + '] [' + miner.network.ip + '/' + miner.network.macaddress + ']: ' + JSON.stringify(miner.temperature));
    }
  }

  var mailOptions = {
    from: parameters.email_from,
    to: parameters.email_to,
    subject: 'Dashboard Alert: ' + textDetails.length + ' miners',
    text: 'A(s) seguinte(s) máquina(s) estão com a temperatura elevada:\n\n'
  };

  if (textDetails.length > 0) {
    mailOptions.text += textDetails.join('\n');
    mailOptions.text += '\n\nTotal: ' + textDetails.length;
    log.debug(">>>>> WE FOUND SOME ALERTS <<<<< \n" + mailOptions.text)
    emailService.sendAlert(mailOptions);
  }
};

exports.countTemperatureAlert = function (temperature) {
  var alertCount = 0;

  if (temperature) {
    if (temperature.temp1 == parameters.monitor_maxtemp ||
      temperature.temp2 == parameters.monitor_maxtemp ||
      temperature.temp3 == parameters.monitor_maxtemp) {
      alertCount = 1;
    }
    if (temperature.temp1 > parameters.monitor_maxtemp ||
      temperature.temp2 > parameters.monitor_maxtemp ||
      temperature.temp3 > parameters.monitor_maxtemp) {
      alertCount = 2;
    }
    if (temperature.temp1 >= parameters.monitor_shutdowntemp ||
      temperature.temp2 >= parameters.monitor_shutdowntemp ||
      temperature.temp3 >= parameters.monitor_shutdowntemp) {
      alertCount = 3;
    }
  }

  return alertCount;
};

exports.countHashboardIssue = function (temperature) {
  var alertCount = 0;

  if (temperature) {
    if (!temperature.temp1 || temperature.temp1 == '' || temperature.temp1 == 0) {
      alertCount++;
    }
    if (!temperature.temp2 || temperature.temp2 == '' || temperature.temp2 == 0) {
      alertCount++;
    }
    if (!temperature.temp3 || temperature.temp3 == '' || temperature.temp3 == 0) {
      alertCount++;
    }

    if (!temperature.temp1 && !temperature.temp2 && !temperature.temp3) {
      alertCount = 0;
    }
  }

  return alertCount;
};

exports.createMQ = function () {
  amqp.connect(env.rabbit_url, (err, conn) => {
    try {
      assert.equal(null, err);
      conn.createChannel((err, ch) => {
        assert.equal(null, err);
        var q = 'dashboard-monitor';

        ch.assertQueue(q, {
          durable: false
        });
        log.debug("Queue service consumer started");
        ch.consume(q, (msg) => {
          try {
            var s9 = JSON.parse(msg.content.toString());
            var temperature = {
              temp1: s9.stats.temp2_6,
              temp2: s9.stats.temp2_7,
              temp3: s9.stats.temp2_8,
              fan3: s9.stats.fan3,
              fan6: s9.stats.fan6
            };
            var alerts = {
              temperature: exports.countTemperatureAlert(temperature),
              hashboard: exports.countHashboardIssue(temperature)
            };
            s9.createdDate = new Date();
            s9.temperature = temperature;
            s9.alerts = alerts;
            s9MinerRepository.insertOrReplace(s9);
            log.debug("adding " + s9.network.ip + " " + s9.network.macaddress);
          } catch (err) {
            log.error(err);
          }
        }, {
          noAck: true
        });
      });
    } catch (err) {
      // wait and restart function
      log.error(err);
      log.error("Can't connect in RabbitMQ!");
      setTimeout(exports.createMQ, 1000 * 15);
    }
  });
};
