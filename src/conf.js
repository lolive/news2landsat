exports.port = process.env.port || 8185;
exports.theProxy = "http://OLIVIER.ROSSEL:7512OLRO*@proxy2.akka.eu:9090";
exports.proxyEnabled = true;

exports.boilerpipeInputUrl = "http://boilerpipe-web.appspot.com/extract?extractor=ArticleExtractor&output=text&extractImages=&url=";
exports.clavinUrl = "http://clavin.berico.us/clavin-web/Services/GeoExtract/ResolvedLocations";

exports.urlStoreArticle = "http://sitools.akka.eu:8183/sitools/datastorage/user/semantic-storage/fr/";
exports.urlUpdateWebSemanticTree = "http://sitools.akka.eu:8183/sitools/datastorage/user/semantic-storage/json/data_fr.json";

exports.logSitools = {
        id: "admin",
        pass: "sitoolsisthebest"
}
