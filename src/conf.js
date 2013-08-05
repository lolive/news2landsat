exports.port = process.env.port || 1337;
exports.proxyOptions = {
    host: "192.168.254.1",
    port: 9090,
    headers: {
        'Proxy-Authorization': 'Basic ' + new Buffer("OLIVIER.ROSSEL" + ':' + "7512OLRO*").toString('base64')
    }
}
exports.theProxy = "http://OLIVIER.ROSSEL:7512OLRO*@proxy2.akka.eu:9090";
exports.proxyEnabled = true;

exports.boilerpipeInputUrl = "http://boilerpipe-web.appspot.com/extract?extractor=ArticleExtractor&output=text&extractImages=&url=";
exports.clavinUrl = "http://clavin.berico.us/clavin-web/Services/GeoExtract/ResolvedLocations";

// exports.clavinUrl = "http://ec2-23-22-172-90.compute-1.amazonaws.com:8080/clavin-web/Services/GeoExtract/ResolvedLocations"; OLD

