const log = require('../helper/Log.helper');
const spawn = require('child_process').spawn;
const stream = require('stream');

exports.init = function(config) {
  var o = function (calback) {
    var writable = new stream.Writable();
    writable._write = function (data) {
      log.debug("result => " + data.toString());
    };
    var spawnedProcess = spawn('tcpdump udp port ' + config.IP_REPORTER_PORT, [], {
      shell: true
    });
    spawnedProcess.stdout.pipe(writable);
  };

  var i = function (calback) {
    var writable = new stream.Writable();
    writable._write = function (data) {
      log.debug("result => " + data);
    };

    var spawnedProcess = spawn('tcpdump udp port ' + config.IP_REPORTER_PORT, [], {
      stdio: [null, 'pipe', 'inherit'],
      shell: true
    });
    spawnedProcess.stdout.pipe(writable);
  };

  var x = function (calback) {
    var spawnedProcess = spawn('tcpdump udp port ' + config.IP_REPORTER_PORT, [], {
      shell: true
    });

    spawnedProcess.stdout.on('data', (result) => {
      log.debug('data: ' + result);
      if (calback) {
        calback(result);
      }
    });
  };


  var startBroadcastListener = function (calback) {
    var spawnedProcess = spawn('tcpdump udp port ' + config.IP_REPORTER_PORT, [], {
      stdio: ['pipe', process.stdout, process.stderr],
      shell: true
    });

    spawnedProcess.on('close', (result) => {
      log.debug('broadcast listener was closed: ' + result);
    });

    spawnedProcess.on('data', (result) => {
      log.debug('data: ' + result);
      if (calback) {
        calback(result);
      }
    });
  };

  log.debug('Tcpdump service started on port ' + config.IP_REPORTER_PORT);
  x((result) => {
    log.debug(">>>>>>>>>>>");
  });
};
