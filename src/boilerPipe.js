var Q = require('q');
var conf = require('./conf.js');
var request = require('./request.js');

exports.articleContent = function (inputUrl) {
    var qq = Q.defer();
    var callBoilerpipe = function (whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError) {
        request.sendHttpRequest(whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError, "GET", conf.boilerpipeInputUrl + /*encodeURIComponent(inputUrl)*/inputUrl);
    };
    callBoilerpipe(qq.resolve, qq.reject);
    return qq.promise;
}