/*  (C) 2012 Premist aka Minku Lee.
 LICENSE : https://github.com/premist/node-crossdomain-proxy/blob/master/LICENSE
 */

/****************************************************************************
* Includes																	*
****************************************************************************/
// NodeJS Modules
//var querystring = require('querystring');
var http = require('http');
var url = require('url');

// Personnal librairies
var Q = require('q');
var conf = require('./conf.js');
var httpReq = require('./httpReq.js');

function articleContent(inputUrl) {
    var qq = Q.defer();
    var callBoilerpipe = function (whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError) {
        httpReq.sendHttpRequest(whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError, "GET", conf.boilerpipeInputUrl + /*encodeURIComponent(inputUrl)*/inputUrl);
    };
    callBoilerpipe(qq.resolve, qq.reject);
    return qq.promise;
}

function resolveLocations(articleText) {
    var qq = Q.defer();
    var callClavin = function callClavin(whatToDoWithClavinResult, whatToDoWithClavinError) {
        httpReq.sendHttpRequest(whatToDoWithClavinResult, whatToDoWithClavinError, "POST", conf.clavinUrl, articleText);
    }
    callClavin(qq.resolve, qq.reject);
    return qq.promise;
}

exports.resolveLocations=resolveLocations;


function annotateText(geonames, articleText) {
    var qq = Q.defer();
    var annotateLocations = function (whatToDoWithAnnotatedText, whatToDoOnAnnotationError) {
        try {
            var annotatedText = articleText;
            if (geonames) {
                var locations = JSON.parse(geonames);
                if (locations.resolvedLocations) {
                    locations.resolvedLocations.forEach(function (resolvedLocation) {
                        var name = resolvedLocation.inputName;
                        var long = resolvedLocation.geoname.longitude;
                        var lat = resolvedLocation.geoname.latitude;
                        annotatedText = annotateLocation(annotatedText, name, long, lat);
                    });
                }
            }
            return whatToDoWithAnnotatedText(annotatedText);
        } catch (e) {
            whatToDoOnAnnotationError(e);
        }
    };
    annotateLocations(qq.resolve, qq.reject);
    return qq.promise;
}
exports.annotateText = annotateText;

function annotateLocation(text, name, long, lat) {

    var replacementText = "$1<a href=\"http://localhost/sparql2mapWidget/GoogleEarth/index.xhtml?long=" + long + "&lat=" + lat + "&name=" +encodeURIComponent(name)+ "\">_" + "$2" + "_</a>$3";
    var regexp = new RegExp("([^_]*)" + "("+name+")" + "([^_]*)", "gi");
    if(text)
        return text.replace(regexp, replacementText);

}
exports.annotateLocation = annotateLocation;

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

//    var toHtml = annotateText(sendResultBackToBrowser, sendErrorBackToBrowser);
//    var toLocations = resolveLocations(toHtml, sendErrorBackToBrowser);
//    var toArticle = articleContent(toLocations, sendErrorBackToBrowser);
//
//    var articleToHtml = toArticle(articleSrc);

    articleContent(articleSrc).spread(resolveLocations).spread(annotateText).then(sendResultBackToBrowser).fail(sendErrorBackToBrowser);


//    var destParams = url.parse(URL);
//
//    var reqOptions = {
//        host : "192.168.254.1",
//        port : 9090,
//        path : URL,
//        method : "GET",
//        headers: {
//            'Proxy-Authorization': 'Basic ' + new Buffer("OLIVIER.ROSSEL" + ':' + "7512OLRO*").toString('base64')
//        }
//    };
//
//    var req = http.request(reqOptions, function(res) {
//        var articleText = "";
//
//        res.on('data', function(chunk) {
//            //proxyResp.write(chunk);
//            articleText += chunk;
//        });
//
//        res.on('end', function() {
//            //proxyResp.end();
//            dbpediaAnswer(articleText);
//        });
//    });
//
//    req.on('error', function(e) {
//        console.log('An error occured: ' + e.message);
//        proxyResp.writeHead(503);
//        proxyResp.write("Error!");
//        proxyResp.end();
//    });
//    req.end();
//
//    function dbpediaAnswer(originalText){
//        var post_data = originalText;
//        var reqOptions =
//        {
//            host : "192.168.254.1",
//            port : 9090,
//            path : "http://ec2-23-22-172-90.compute-1.amazonaws.com:8080/clavin-web/Services/GeoExtract/ResolvedLocations",
//            method : "POST",
//            headers:
//            {
//                'Proxy-Authorization': 'Basic ' + new Buffer("OLIVIER.ROSSEL" + ':' + "7512OLRO*").toString('base64'),
//                'Host': "ec2-23-22-172-90.compute-1.amazonaws.com:8080",
//                'Content-Length': post_data.length
//            }
//        };
//        var req = http.request(reqOptions, function(res) {
//            var geonamesJson = "";
//
//            res.on('data', function(chunk) {
//                geonamesJson += chunk;
//            });
//
//            res.on('end', function() {
//                var geonames = JSON.parse(geonamesJson);
//                landsatAnswer(geonames);
//            });
//        });
//        req.on('error', function(e) {
//            console.log('An error occured: ' + e.message);
//            proxyResp.writeHead(503);
//            proxyResp.write("Error!");
//            proxyResp.end();
//        });
//        req.write(post_data);
//        req.end();
//    }
//
//    function landsatAnswer(geonames){
//        var post_data="";
//        console.log("toto");
//        if(geonames && geonames.resolvedLocations)
//        geonames.resolvedLocations.forEach(function(resolvedLocation){
//            post_data += resolvedLocation.inputName;
//            //post_data += resolvedLocation.;
//        });
//        proxyResp.writeHead(200);
//        proxyResp.write(post_data);
//        proxyResp.end();
//        return;
//        var reqOptions =
//        {
//            host : "localhost",
//            port : 9013,
//            path : "/sparql/",
//            method : "POST",
//            headers:
//            {
//                'Content-Length': post_data.length
//            }
//        };
//        var req = http.request(reqOptions, function(res) {
//            var headers = res.headers;
//            headers['Access-Control-Allow-Origin'] = '*';
//            headers['Access-Control-Allow-Headers'] = 'X-Requested-With';
//            proxyResp.writeHead(200, headers);
//
//            res.on('data', function(chunk) {
//                proxyResp.write(chunk);
//            });
//
//            res.on('end', function() {
//                proxyResp.end();
//            });
//        });
//        req.on('error', function(e) {
//            console.log('An error occured: ' + e.message);
//            proxyResp.writeHead(503);
//            proxyResp.write("Error!");
//            proxyResp.end();
//        });
//        req.write(post_data);
//        req.end();
//    }
//


}).listen(conf.port);