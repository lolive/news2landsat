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
var articleSI2 = require('./createArticle.js');

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

    function sendResultBackToBrowser(validCreation, articleText) {
        console.log(articleText);
		
        proxyResp.setHeader("Content-Type", "text/html; charset=utf-8");
        proxyResp.writeHead(200);
        proxyResp.write(articleText);
        proxyResp.end();
    }

    boilerPipe.articleContent(articleSrc).spread(clavin.resolveLocations).spread(annotate.annotateText).then(articleSI2.createSiToolsArticle).spread(sendResultBackToBrowser).fail(sendErrorBackToBrowser);

}).listen(conf.port);