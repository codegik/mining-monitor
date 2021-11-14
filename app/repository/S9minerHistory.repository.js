const dbConnection = require('./DBConnection');
const assert = require('assert');

const document = 'S9minerHistory';

var insert = function (miner, callback) {
  dbConnection.get(db => {
    db.collection(document).insertOne(miner, (err, result) => {
      assert.equal(err, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

var insertAll = function (minerList, callback) {
  dbConnection.get(db => {
    minerList.map(miner => {
      delete miner._id;
    });
    db.collection(document).insertMany(minerList, (err, result) => {
      assert.equal(err, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

var findAll = function (callback) {
  dbConnection.get(db => {
    db.collection(document).find({}).toArray((err, results) => {
      callback(results);
    });
  });
};

exports.insert = insert;
exports.insertAll = insertAll;
exports.findAll = findAll;
