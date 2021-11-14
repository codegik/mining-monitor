const dbConnection = require('./DBConnection');
const assert = require('assert');
const indicatorHistoryRepository = require('./IndicatorHistory.repository');

const document = 'IndicatorCurrent';

var insertOrReplace = function (indicator, callback) {
  dbConnection.get(db => {
    db.collection(document).deleteMany((err, result) => {
      // insert new one into current
      db.collection(document).insertOne(indicator, function (err, result) {
        assert.equal(err, null);
        if (callback) {
          callback(result.ops[0]);
        }
      });
    });
  });
};

var findOne = function (callback) {
  dbConnection.get(db => {
    db.collection(document).find({}).toArray(function (err, result) {
      callback(result);
    });
  });
};

var deleteAll = function (callback) {
  dbConnection.get(db => {
    db.collection(document).deleteMany({}, function (err, result) {
      assert.equal(err, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

exports.insertOrReplace = insertOrReplace;
exports.findOne = findOne;
exports.deleteAll = deleteAll;
