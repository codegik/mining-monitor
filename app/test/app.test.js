const log = require('../helper/Log.helper');
const exec = require('child_process').exec;

exec("cat ./miner.out", function (error, stdout, stderr) {
    log.debug(JSON.parse(stdout));
});