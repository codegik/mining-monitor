const dbConnection = require('./DBConnection');
const assert = require('assert');

const document = 'IndicatorHistory';

var insert = function (indicator, callback) {
  dbConnection.get(db => {
    db.collection(document).insertOne(indicator, function (err, result) {
      assert.equal(err, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

var insertAll = function (indicators, callback) {
  dbConnection.get(db => {
    indicators.map(indicator => {
      delete indicator._id;
    });
    db.collection(document).insertMany(indicators, function (err, result) {
      assert.equal(err, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

var findAll = function (callback) {
  dbConnection.get(db => {
    db.collection(document).find({}).toArray(function (err, results) {
      callback(results);
    });
  });
};

exports.insert = insert;
exports.insertAll = insertAll;
exports.findAll = findAll;
