var Q = require('q');
var conf = require('./conf.js');
var httpReq = require('./httpReq.js');

exports.resolveLocations = function (articleText) {
    var qq = Q.defer();
    var callClavin = function callClavin(whatToDoWithClavinResult, whatToDoWithClavinError) {
        httpReq.sendHttpRequest(whatToDoWithClavinResult, whatToDoWithClavinError, "POST", conf.clavinUrl, articleText);
    }
    callClavin(qq.resolve, qq.reject);
    return qq.promise;
}