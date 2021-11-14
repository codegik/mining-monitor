const log = require('../helper/Log.helper');
const nodemailer = require('nodemailer');
const configService = require('./Config.service');

var transporter = null;

exports.sendAlert = function (mailOptions) {
  if (process.env.email_password) {
    configService.getConfig(config => {
      if (!transporter) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: config.email_user,
            pass: process.env.email_password
          }
        });
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          log.debug(error);
        } else {
          log.debug('Email sent: ' + info.response);
        }
      });
    });
  } else {
    log.error('Cannot send email, please set email_password env variable in your system!');
  }
};
