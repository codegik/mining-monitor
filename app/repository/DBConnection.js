const env = require('../environments');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mysql = require('mysql');

var dbConn = null;
var statisticConn = null;

var get = function (callback) {
  if (dbConn) {
    callback(dbConn);
  } else {
    MongoClient.connect(env.database_url, (err, db) => {
      assert.equal(null, err);
      dbConn = db;
      db.on('close', () => {
        dbConn = null;
      });
      callback(dbConn);
    });
  }
};

var getStatistic = function (callback) {
  if (statisticConn) {
    callback(statisticConn);
  } else {
    statisticConn = mysql.createConnection({
      host: env.mysql_database_host,
      user: env.mysql_database_user,
      password: env.mysql_database_passwd,
      database: env.mysql_database
    });
    statisticConn.connect((err) => {
      assert.equal(null, err);
      callback(statisticConn);
    });
  }
};

exports.get = get
exports.getStatistic = getStatistic
