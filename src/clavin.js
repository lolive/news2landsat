var Q = require('q');
var conf = require('./conf.js');
var request = require('./request.js');

exports.resolveLocations = function (articleText) {
    var qq = Q.defer();
    var callClavin = function callClavin(whatToDoWithClavinResult, whatToDoWithClavinError) {
        request.sendHttpRequest(whatToDoWithClavinResult, whatToDoWithClavinError, "POST", conf.clavinUrl, articleText);
    }
    callClavin(qq.resolve, qq.reject);
    return qq.promise;
}