var Q= require('q');
var conf = require('./conf.js');
var request = require('./request.js');
var ctx=this;


function callClavin(articleText) {
    var deferr = Q.defer();
    var success = function(response){
        ctx.locations = response.body;
        /*then*/ deferr.resolve(response);};
    var error =  function(e){
        deferr.reject(e);
    }

    request.sendHttpRequest(
        {
            uri: conf.clavinUrl,
            method: "POST",
            body: articleText,
            error: error,
            success: success

        }
    );

    return deferr.promise;
}

//function resolveLocations(articleText) {
//    var qq = Q.defer();
//    callClavin(qq.resolve, qq.reject, articleText);
//    return qq.promise;
//}

//exports.resolveLocations = function(){
//    var realArguments = arguments;
//    return function(){
//        callClavin.apply(this, realArguments)}
//};
exports.callClavin = callClavin;