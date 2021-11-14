const dbConnection = require('./DBConnection');
const assert = require('assert');

const document = 'Place';

var save = function (place, callback) {
  dbConnection.get(db => {
    db.collection(document).findOne({
      "macaddress": place.macaddress
    }, (err, result) => {
      assert.equal(err, null);
      if (result) {
        db.collection(document).replaceOne({
          "macaddress": place.macaddress
        }, place, (err, result) => {
          assert.equal(err, null);
          if (callback) {
            callback(result);
          }
        });
      } else {
        db.collection(document).insertOne(place, function (error, result) {
          assert.equal(error, null);
          if (callback) {
            callback(result);
          }
        });
      }
    });
  });
};

var findOneByMacAddress = function (macaddress, callback) {
  dbConnection.get(db => {
    db.collection(document).findOne({
      "macaddress": macaddress
    }, (err, place) => {
      callback(place);
    });
  });
};

var findAll = function (callback) {
  dbConnection.get(db => {
    db.collection(document).find({}).toArray(function (error, results) {
      callback(results);
    });
  });
};

var getMap = function (callback) {
  findAll(places => {
    var mapResult = {};
    for (var place of places) {
      mapResult[place.macaddress] = place.place;
    }
    if (callback) {
      callback(mapResult);
    }
  });
};


exports.save = save;
exports.findOneByMacAddress = findOneByMacAddress;
exports.findAll = findAll;
exports.getMap = getMap;
