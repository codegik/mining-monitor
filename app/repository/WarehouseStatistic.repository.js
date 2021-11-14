const dbConnection = require('./DBConnection');
const assert = require('assert');

const document = 'WarehouseHistory';
const sqlTable = 'CREATE TABLE IF NOT EXISTS ' + document + ' (' +
  '_id varchar(25) not null primary key, ' +
  'created_date datetime not null, ' +
  'chamber1_temperature1 decimal(5, 2) default 0, ' +
  'chamber1_temperature2 decimal(5, 2) default 0, ' +
  'chamber1_humidity int default 0, ' +
  'chamber2_temperature1 decimal(5, 2) default 0, ' +
  'chamber2_temperature2 decimal(5, 2) default 0, ' +
  'chamber2_humidity int default 0, ' +
  'chamber3_temperature1 decimal(5, 2) default 0, ' +
  'chamber3_temperature2 decimal(5, 2) default 0, ' +
  'chamber3_humidity int default 0, ' +
  'outside_temperature1 decimal(5, 2) default 0, ' +
  'outside_temperature2 decimal(5, 2) default 0, ' +
  'outside_humidity int default 0' +
  ')';


var insert = function (item, callback) {
  dbConnection.getStatistic(db => {
    db.query(sqlTable, (err, result) => {
      assert.equal(err, null);
      const object = toInlineObject(item);
      const columns = Object.keys(object).join(',');
      db.query('INSERT INTO ' + document + ' (' + columns + ') VALUES (?) ', [objectToArray(object)], (err, result) => {
        assert.equal(err, null);
        if (callback) {
          callback(result);
        }
      });
    });
  });
};

var objectToArray = function (obj) {
  var arr = obj instanceof Array;

  return (arr ? obj : Object.keys(obj)).map((i) => {
    var val = arr ? i : obj[i];
    if (typeof val === 'object') {
      if (typeof i === 'string' && i.toLowerCase().indexOf("date") != -1) {
        return val.toISOString().replace(/T/, ' ').replace(/\..+/, '');
      }
      if (i == "_id") {
        return val + '';
      }
      return objectToArray(val);
    }
    return val;
  });
};

var toInlineObject = function (obj) {
  return {
    _id: obj._id + '',
    created_date: obj.createdDate.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
    chamber1_temperature1: obj.chambers[0].temperature1,
    chamber1_temperature2: obj.chambers[0].temperature2,
    chamber1_humidity: obj.chambers[0].humidity,
    chamber2_temperature1: obj.chambers[1].temperature1,
    chamber2_temperature2: obj.chambers[1].temperature2,
    chamber2_humidity: obj.chambers[1].humidity,
    chamber3_temperature1: obj.chambers[2].temperature1,
    chamber3_temperature2: obj.chambers[2].temperature2,
    chamber3_humidity: obj.chambers[2].humidity,
    outside_temperature1: obj.outside.temperature1,
    outside_temperature2: obj.outside.temperature2,
    outside_humidity: obj.outside.humidity
  };
};

exports.insert = insert;


var sample = {
  "_id": "59e0ff2b64e0a92277d7fb73",
  "chambers": [{
      "name": "1",
      "temperature1": 20.699999999999999289,
      "temperature2": 23.100000000000001421,
      "humidity": 84
    },
    {
      "name": "2",
      "temperature1": 20.5,
      "temperature2": 21.699999999999999289,
      "humidity": 87
    },
    {
      "name": "3",
      "temperature1": 21.600000000000001421,
      "temperature2": 23.199999999999999289,
      "humidity": 83
    }
  ],
  "outside": {
    "name": "External",
    "temperature1": 25.199999999999999289,
    "temperature2": 24.100000000000001421,
    "humidity": 66
  },
  "indicators": [{
      "user": "paterminer",
      "statistic": {
        "scannedDate": new Date(1507917611239),
        "s9UnknownLocation": 472,
        "s9Total": 472,
        "s9TotalDanger": 0,
        "s9TotalWarning": 0,
        "s9TotalInfo": 136,
        "s9TotalNormal": 336,
        "s9TotalHashboardIssue": 8,
        "s9TotalHashes": 6415420.8499999986961,
        "s9TotalHashesLabel": "6.415 PH/s"
      }
    },
    {
      "user": "versa",
      "statistic": {
        "scannedDate": new Date(1507917611321),
        "s9UnknownLocation": 17,
        "s9Total": 17,
        "s9TotalDanger": 0,
        "s9TotalWarning": 0,
        "s9TotalInfo": 4,
        "s9TotalNormal": 13,
        "s9TotalHashboardIssue": 2,
        "s9TotalHashes": 214904.54000000000815,
        "s9TotalHashesLabel": "0.215 PH/s"
      }
    }
  ],
  "createdDate": new Date(1507917611323)
};
