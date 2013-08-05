/*  (C) 2012 Premist aka Minku Lee.
 LICENSE : https://github.com/premist/node-crossdomain-proxy/blob/master/LICENSE
 */

/****************************************************************************
* Includes																	*
****************************************************************************/
// NodeJS Modules
var http = require('http');
var url = require('url');

// Personnal librairies
var Q = require('q');
var conf = require('./conf.js');
var boilerPipe = require('./boilerPipe.js');
var clavin = require('./clavin.js');
var annotate = require('./annotate.js');
var request = require('./request.js');

exports.resolveLocations=clavin.resolveLocations;
exports.annotateText = annotate.annotateText;
exports.annotateLocation = annotate.annotateLocation;

http.createServer(function (proxyReq, proxyResp) {

    var params = url.parse(proxyReq.url, true);
    var articleSrc = params.query.src;

    function sendErrorBackToBrowser(e) {
        console.log('An error occured: ' + e.message);
        proxyResp.writeHead(503);
        proxyResp.write("Error:" + e.message);
        proxyResp.end();
    }

    function sendResultBackToBrowser(text) {
        console.log(text);
        proxyResp.setHeader("Content-Type", "text/html; charset=utf-8");
        proxyResp.writeHead(200);
        proxyResp.write(text);
        proxyResp.end();
    }

    boilerPipe.articleContent(articleSrc).spread(clavin.resolveLocations).spread(annotate.annotateText).then(sendResultBackToBrowser).fail(sendErrorBackToBrowser);

}).listen(conf.port);