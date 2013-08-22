var Q = require('q');
var conf = require('./conf.js');
var request = require('./request.js');
var ctx=this;



function callBoilerpipe(url) {
    var defer = Q.defer();
    var success = function(response){
        ctx.article = response.body;
        /*then*/ defer.resolve(response);};
    var error =  defer.reject;


    request.sendHttpRequest(
        {
            uri: conf.boilerpipeInputUrl + url,
            method: "GET",
            //body:
            success: success,
            error: error
        }
    )
    return defer.promise;
};

exports.callBoilerpipe = callBoilerpipe;
//exports.articleContent = function(arg){return function(){callBoilerpipe.apply(this, arg)}};
