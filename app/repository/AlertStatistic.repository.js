const dbConnection = require('./DBConnection');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;

const document = 'AlertHistory';
const sqlTable = 'CREATE TABLE IF NOT EXISTS ' + document + ' (' +
  '_id varchar(25) not null primary key, ' +
  'createdDate datetime not null, ' +
  'ip varchar(16), ' +
  'alert varchar(100)' +
  ')';


var insert = function (item, callback) {
  dbConnection.getStatistic(db => {
    db.query(sqlTable, (err, result) => {
      assert.equal(err, null);
      item._id = new ObjectID().toHexString();
      item.createdDate = new Date();
      const columns = Object.keys(item).join(',');
      const object = objectToArray(item);
      console.log(object);
      db.query('INSERT INTO ' + document + ' (' + columns + ') VALUES (?) ', [object], (err, result) => {
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

exports.insert = insert;
