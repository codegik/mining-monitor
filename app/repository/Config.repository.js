const env = require('../environments');
const dbConnection = require('./DBConnection');
const assert = require('assert');

const document = 'Config';
const defaultValues = env;

var findOne = function (callback) {
  dbConnection.get(db => {
    db.collection(document).findOne({}, (err, result) => {
      // if doesnt exists, insert default values
      if (result == null) {
        db.collection(document).insertOne(defaultValues, (err, result) => {
          db.collection(document).findOne({}, (err, result) => {
            callback(result);
          });
        });
      } else {
        callback(result);
      }
    });
  });
};

var save = function (config, callback) {
  dbConnection.get(db => {
    db.collection(document).deleteMany({}, (err, result) => {
      assert.equal(null, err);
      db.collection(document).insertOne(config, (err, result) => {
        assert.equal(null, err);
        if (callback) {
          callback(result);
        }
      });
    });
  });
};


exports.findOne = findOne;
exports.save = save;
