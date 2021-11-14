const dbConnection = require('./DBConnection');
const assert = require('assert');

const document = 'IndicatorHistory';
const sqlTable = 'CREATE TABLE IF NOT EXISTS ' + document + ' (' +
  '_id varchar(25) not null primary key, ' +
  'scannedDate datetime not null, ' +
  's9UnknownLocation int default 0, ' +
  's9Total int default 0, ' +
  's9TotalDanger int default 0, ' +
  's9TotalWarning int default 0, ' +
  's9TotalInfo int default 0, ' +
  's9TotalNormal int default 0, ' +
  's9TotalHashboardIssue int default 0, ' +
  's9TotalHashes decimal(20, 10) default 0, ' +
  's9TotalHashesLabel varchar(25))';


var insert = function (indicator, callback) {
  dbConnection.getStatistic(db => {
    db.query(sqlTable, (err, result) => {
      assert.equal(err, null);
      const columns = Object.keys(indicator).join(',');
      const object = objectToArray(indicator);
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
