const dbConnection = require('./DBConnection');
const assert = require('assert');

const document = 'Warehouse';

var insert = function (warehouse, callback) {
  dbConnection.get(db => {
    warehouse.createdDate = new Date();
    db.collection(document).insertOne(warehouse, function (err, result) {
      assert.equal(err, null);
      if (callback) {
        callback(result.ops[0]);
      }
    });
  });
};

var findAll = function (callback) {
  dbConnection.get(db => {
    db.collection(document).find({}).sort({
      createdDate: -1
    }).toArray(function (err, results) {
      callback(results);
    });
  });
};

exports.insert = insert;
exports.findAll = findAll;
