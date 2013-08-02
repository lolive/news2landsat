var Q = require('q');
var conf = require('./conf.js');
var httpReq = require('./httpReq.js');

exports.articleContent = function (inputUrl) {
    var qq = Q.defer();
    var callBoilerpipe = function (whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError) {
        httpReq.sendHttpRequest(whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError, "GET", conf.boilerpipeInputUrl + /*encodeURIComponent(inputUrl)*/inputUrl);
    };
    callBoilerpipe(qq.resolve, qq.reject);
    return qq.promise;
}