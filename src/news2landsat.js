/*  (C) 2012 Premist aka Minku Lee.
 LICENSE : https://github.com/premist/node-crossdomain-proxy/blob/master/LICENSE
 */

//var querystring = require('querystring');
var http = require('http');
var url = require('url');
var request = require('request');
var servSparql = "sitools.akka.eu";
var urlStoreArticle = "http://sitools.akka.eu:8183/sitools/datastorage/user/semantic-storage/fr/";
var updateWebSemanticTree = "http://sitools.akka.eu:8183/sitools/datastorage/user/semantic-storage/json/data_fr.json";
var logSitools = {
    id: "admin",
    pass: "sitoolsisthebest"
}
//var q = require('q');
var port = process.env.port || 8185;
var proxyOptions = {
    host: "192.168.254.1",
    port: 9090,
    headers: {
        'Proxy-Authorization': 'Basic ' + new Buffer("OLIVIER.ROSSEL" + ':' + "7512OLRO*").toString('base64')
    }
}
var proxyEnabled = true;

var theProxy;
if (proxyEnabled) {
    theProxy = "http://OLIVIER.ROSSEL:7512OLRO*@proxy2.akka.eu:9090";
}

function sendHttpRequest(whatToDoWithResponse, whatToDoWithError, theMethod, theUrl, postData) {
    if (proxyEnabled) {
        var reqOptions = {};
        reqOptions.host = proxyOptions.host;
        reqOptions.port = proxyOptions.port;
        reqOptions.path = theUrl;
        reqOptions.headers = {};
        reqOptions.headers['Proxy-Authorization'] = proxyOptions.headers['Proxy-Authorization'];
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
            whatToDoWithResponse(responseText, postData);
        });
    });

    req.on('error', function (e) {
        whatToDoWithError(e);
    });
    if (postData)
        req.write(postData);
    req.end();
}

function articleContent(whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError) {
    return function callBoilerpipe(inputUrl) {
        var boilerpipeInputUrl = "http://boilerpipe-web.appspot.com/extract?extractor=ArticleExtractor&output=text&extractImages=&url=" + /*encodeURIComponent(inputUrl)*/inputUrl;
        sendHttpRequest(whatToDoWithBoilerpipeResult, whatToDoWithBoilerpipeError, "GET", boilerpipeInputUrl);
    }
}

function resolveLocations(whatToDoWithClavinResult, whatToDoWithClavinError) {
    var clavinUrl = "http://clavin.berico.us/clavin-web/Services/GeoExtract/ResolvedLocations";
    return function callClavin(articleText) {
        sendHttpRequest(whatToDoWithClavinResult, whatToDoWithClavinError, "POST", clavinUrl, articleText);
    }
}
exports.resolveLocations=resolveLocations;


function annotateText(whatToDoWithAnnotatedText, whatToDoOnAnnotationError) {
    return function (geonames, articleText) {
        var title = getTitle(articleText);
        try {
            var annotatedText = articleText;
            if (geonames) {
                var locations = JSON.parse(geonames);
                if (locations.resolvedLocations) {
                    locations.resolvedLocations.forEach(function (resolvedLocation) {
                        var name = resolvedLocation.inputName;
                        annotatedText = surroundWithUndescore(annotatedText, name);
                    });
                    
                    locations.resolvedLocations.forEach(function (resolvedLocation) {
                        var name = resolvedLocation.inputName;
                        var long = resolvedLocation.geoname.longitude;
                        var lat = resolvedLocation.geoname.latitude;
                        annotatedText = annotateLocation(annotatedText, name, long, lat, title);
                    });
                }
            }
            return whatToDoWithAnnotatedText(annotatedText, geonames, title);
        } catch (e) {
            whatToDoOnAnnotationError(e);
        }
    }
}
exports.annotateText = annotateText;

function annotateLocation(text, name, long, lat, textTitle) {
    
    var resource = "http://sitools.akka.eu/landsatrdf/details/"+encodeURIComponent(name)+"/forArticle/"+encodeURIComponent(textTitle);
    var link = "http://sitools.akka.eu:8183/sitools/datastorage/user/semantic-storage/demo/sparql2mapWidget/flickrRibbon/sparql2kml2googleEarth.html?long=" + long + "&lat=" + lat + "&name=" +encodeURIComponent(name)+"&articleUrl="+urlStoreArticle+"&resource="+resource+"&articleTitle=" + textTitle + ".html";
    var replacementText = "<a href=\""+link+"\" property=\"http://sitools.akka.eu/landsatrdf/annotatedBy\" resource=\""+resource+"\" title=\"URI = "+"http://sitools.akka.eu/landsatrdf/details/"+encodeURIComponent(name)+"/forArticle/"+encodeURIComponent(textTitle)+"\" target=\"_newtab\">" + "$&" + "</a>";
    var regexp = new RegExp("_"+name+"_", "gi");
    return text.replace(regexp, replacementText);
}
exports.annotateLocation = annotateLocation;

function surroundWithUndescore(text, name) {    
    var replacementText = "_$&_";
    var regexp = new RegExp(name, "gi");
    return text.replace(regexp, replacementText);
}

function getTitle(text) {
    var dt = new Date();
//    var title = text.substr(0, text.indexOf('\n')) + "_" + dt.toISOString(); 
    var title = text.substr(0, text.indexOf('\n')); 
    return title.replace(/:/g,'_').replace('.','_').replace(' ','_');
}

http.createServer(function (proxyReq, proxyResp) {


    var params = url.parse(proxyReq.url, true);
    var articleSrc = params.query.src;

    function sendErrorBackToBrowser(e) {
        console.log('An error occured: ' + e.message);
        proxyResp.writeHead(503);
        proxyResp.write("Error:" + e.message);
        proxyResp.end();
    }

    function sendResultBackToBrowser(text, geonames, textTitle) {       
        if (text.substr(0,6) != "<html>"){
            var formattedText = "<html>\n<head>\n<title>" + textTitle + "</title>\n</head>\n<body about='"+articleSrc+"'>\n<p>" + text.replace(/\n/g, '</p>\n<p>') + "</p>\n</body>\n</html>";
            var file = formattedText + "\n<!--url:" + articleSrc + "\ngeonames:" + geonames + "-->"
            request({
                uri: urlStoreArticle + textTitle + ".html",
                method: "PUT",
//              proxy: theProxy,
                followAllRedirects: true,
                body: file,
                headers: {
                    'Content-Type': 'text/html',
                    'Content-Length': file.length,
                    'Authorization': 'Basic ' + new Buffer(logSitools.id + ':' + logSitools.pass).toString('base64'),
                    'Connection': 'keep-alive'
                }
            }, function(error, response, body) {
                if (error)
                    sendErrorBackToBrowser(error);
                else
                    request({
                        uri: updateWebSemanticTree,
                        method: "GET",
                        headers: {
                            'Authorization': 'Basic ' + new Buffer(logSitools.id + ':' + logSitools.pass).toString('base64'),
                        }
                    }, function(error, response, body) {
                        if (error)
                            sendErrorBackToBrowser(error);
                        else
                            var retBody = body.substr(1, body.length-1);
                            var newBody = JSON.parse(body);
                            var newArticle = {
                                text: textTitle,
                                leaf: true,
                                icon: "/sitools/common/res/images/icons/invalid.png",
                                sync: false,
                                link: "/fr/" + encodeURIComponent(textTitle) + ".html"
                            };
                            //the json return is an array with only one child, the real childs are below
                            var children = newBody;
                            var articles;
                            for (var i = 0; i < children.length; i++) {
                                if (children[i].text == "Articles"){
                                    articles = children[i];
                                }
                            }
                            
                            if(articles == undefined) {
                                articles = {
                                    text : "Articles",
                                    leaf : false,
                                    children : []
                                }
                                children.push(articles);
                            }
                            articles.children.push(newArticle);
                            
                            request({
                                uri: updateWebSemanticTree,
                                method: "PUT",
                                followAllRedirects: true,
                                json: newBody,
                                headers: {
                                    'Content-Type': 'text/json',
                                    'Authorization': 'Basic ' + new Buffer(logSitools.id + ':' + logSitools.pass).toString('base64'),
                                    'Connection': 'keep-alive'
                                }
                            }, function(error, response, body) {
                                if (error)
                                    sendErrorBackToBrowser(error);
                            });
                    });
            });
            
            proxyResp.setHeader("Content-Type", "text/html; charset=utf-8");
            proxyResp.writeHead(200);
            proxyResp.write(formattedText);
            proxyResp.end();
        }
    }
    
    var toHtml = annotateText(sendResultBackToBrowser, sendErrorBackToBrowser);
    var toLocations = resolveLocations(toHtml, sendErrorBackToBrowser);
    var toArticle = articleContent(toLocations, sendErrorBackToBrowser);
    
    var articleToHtml = toArticle(articleSrc);
    
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


}).listen(port);
