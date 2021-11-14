const log = require('../helper/Log.helper');
const express = require('express');
const md5File = require('md5-file');
const fs = require('fs');
const emailService = require('./Email.service');
const env = require('../environments');
const constants = require('../constants');
const s9minerService = require('../service/S9miner.service');

exports.init = function (config) {
  var app = express();
  var agentFile = './app/service/vminer-agent.sh';

  app.get('/shutdown', function (req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end('Exiting gracefully :)\n');
    log.debug('Exiting gracefully :)');
    process.exit(0);
  });

  app.get('/agent/vminer-agent.sh', function (req, res) {
    res.download(agentFile);
  });

  app.get('/agent/vminer-agent.sh.md5', function (req, res) {
    var hash = md5File.sync(agentFile);
    fs.writeFile(agentFile + '.md5', hash, err => {
      res.download(agentFile + '.md5');
    });
  });

  app.get('/agent/:ip/shutdown-report', function (req, res) {
    s9minerService.updateAlert(req.params.ip, constants.AUTOMATIC_REBOOT, result => {
      if (config.email_send_shutdown_alert) {
        var text = 'The machine ' + req.params.ip + ' was automatically shut down';
        var mailOptions = {
          from: env.email_from,
          to: env.email_to,
          subject: 'Dashboard Alert: Automatically shut down ' + req.params.ip,
          text: text
        };
        log.debug(text);
        emailService.sendAlert(mailOptions);
      }
      res.end('Noted!');
    });
  });

  app.listen(config.REST_PORT, function () {
    log.debug('Rest service started on port ' + config.REST_PORT);
  });
};
