var http = require('http');
var url = require('url');
var conf = require('./conf.js');

exports.sendHttpRequest = function (whatToDoWithResponse, whatToDoWithError, theMethod, theUrl, postData) {
    if (conf.proxyEnabled) {
        var reqOptions = {};
        reqOptions.host = conf.proxyOptions.host;
        reqOptions.port = conf.proxyOptions.port;
        reqOptions.path = theUrl;
        reqOptions.headers = {};
        reqOptions.headers['Proxy-Authorization'] = conf.proxyOptions.headers['Proxy-Authorization'];
    } else {
        var theParsedUrl = url.parse(theUrl);
        var reqOptions = {};
        reqOptions.host = theParsedUrl.hostname;
        reqOptions.port = theParsedUrl.port;
        reqOptions.path = theParsedUrl.path;
        reqOptions.headers = {};
    }
    if (postData)
        reqOptions.headers['Content-Length'] = postData.length;

    reqOptions.method = theMethod;


    var req = http.request(reqOptions, function (res) {
        var responseText = "";

        res.on('data', function (chunk) {
            //proxyResp.write(chunk);
            responseText += chunk;
        });

        res.on('end', function () {
            //proxyResp.end();
            whatToDoWithResponse([responseText, postData]);
        });
    });

    req.on('error', function (e) {
        whatToDoWithError(e);
    });
    if (postData)
        req.write(postData);
    req.end();
}