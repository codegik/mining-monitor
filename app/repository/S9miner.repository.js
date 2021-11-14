const dbConnection = require('./DBConnection');
const assert = require('assert');
const s9minerHistoryRepository = require('./S9minerHistory.repository');

const document = 'S9minerCurrent';

var insertOrReplace = function (miner, callback) {
  dbConnection.get(db => {
    // delete founded registry from current
    db.collection(document).deleteMany({
      "network.macaddress": miner.network.macaddress
    }, (error, res) => {
      // insert new one into current
      db.collection(document).insertOne(miner, (error, result) => {
        assert.equal(error, null);
        if (callback) {
          callback(result);
        }
      });
    });
  });
};

var findAll = function (callback) {
  dbConnection.get(db => {
    db.collection(document).find({}).toArray((error, results) => {
      callback(results);
    });
  });
};

var findAllByParams = function (params, callback) {
  dbConnection.get(db => {
    var filters = {};
    if (params.user) {
      filters['pools.0.User'] = {
        "$regex": "^" + params.user
      };;
    }
    db.collection(document).find(filters).toArray((error, results) => {
      callback(results);
    });
  });
};

var deleteByOldDateCreated = function (date, callback) {
  dbConnection.get(db => {
    db.collection(document).find({
      "createdDate": {
        "$lte": date
      }
    }).toArray((error, results) => {
      results.map(result => {
        db.collection(document).deleteMany({
          "network.macaddress": result.network.macaddress
        });
      });
      callback(results);
    });
  });
};

var deleteAll = function (callback) {
  dbConnection.get(db => {
    db.collection(document).deleteMany({}, (error, result) => {
      assert.equal(error, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

var deleteOne = function (miner, callback) {
  dbConnection.get(db => {
    db.collection(document).deleteOne({
      "network.macaddress": miner.macaddress
    }, (error, result) => {
      assert.equal(error, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

var update = function (miner, callback) {
  dbConnection.get(db => {
    db.collection(document).findOne({
      "_id": miner._id
    }, (error, result) => {
      if (result) {
        db.collection(document).replaceOne({
          "_id": miner._id
        }, miner, (err, result) => {
          assert.equal(err, null);
          if (callback) {
            callback(result);
          }
        });
      }
    });
  });
};

var updateAlert = function (ip, text, callback) {
  dbConnection.get(db => {
    db.collection(document).updateMany({
      "network.ip": ip
    }, {
      $set: {
        "alerts.info": text
      }
    }, (err, result) => {
      assert.equal(err, null);
      if (callback) {
        callback(result);
      }
    });
  });
};

var sortByTempDesc = function (miners, mapTemp) {
  var compareMiners = function (a, b) {
    if (mapTemp) {
      if (!mapTemp[a.network.macaddress]) {
        return 1;
      }
      if (!mapTemp[b.network.macaddress]) {
        return -1;
      }

      var alertA = mapTemp[a.network.macaddress].alerts.temperature;
      var alertB = mapTemp[b.network.macaddress].alerts.temperature;
      var tempA = mapTemp[a.network.macaddress].temperature;
      var tempB = mapTemp[b.network.macaddress].temperature;
      var totalA = tempA.temp1 + tempA.temp2 + tempA.temp3;
      var totalB = tempB.temp1 + tempB.temp2 + tempB.temp3;

      if (totalA < totalB && alertA < alertB) {
        return 1;
      }
      if (totalA > totalB && alertA > alertB) {
        return -1;
      }
    }
    return 0;
  };

  return miners.sort(compareMiners);
};

exports.insertOrReplace = insertOrReplace;
exports.findAll = findAll;
exports.findAllByParams = findAllByParams;
exports.deleteOne = deleteOne;
exports.deleteAll = deleteAll;
exports.deleteByOldDateCreated = deleteByOldDateCreated;
exports.update = update;
exports.updateAlert = updateAlert;
exports.sortByTempDesc = sortByTempDesc;
