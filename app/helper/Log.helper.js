
var date = function() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

var debug = function(text) {
    console.log('[' + date() + '] ' + text);
};

var error = function(text) {
    console.error('[' + date() + '] ' + text);
};

exports.debug = debug;
exports.error = error;