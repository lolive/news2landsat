/**
 * Created with IntelliJ IDEA.
 * User: olivier.rossel
 * Date: 15/07/13
 * Time: 13:58
 * To change this template use File | Settings | File Templates.
 */

var assert = require('assert');
var news2landsat = require('../src/news2landsat');

exports['annotateText'] = function (test) {
    var text = news2landsat.annotateLocation("Paris is beautiful", "Paris", "1", "2");
    test.equal(text,
        "<a href=\"http://localhost/sparql2mapWidget/GoogleEarth/index.xhtml?long=" + "1" + "&lat=" + "2" + "&name=" +"Paris"+ "\">"
            + "_Paris_"
            + "</a>"
            + " is beautiful");
    test.done();
}

exports['geoname2annotatedText'] = function (test) {
    var onAnnotationSuccess = function (text) {
        test.equal(text,
            "<a href=\"http://localhost/sparql2mapWidget/GoogleEarth/index.xhtml?long=" + "1" + "&lat=" + "2" + "&name=" +"Paris"+ "\">"
                + "_Paris_"
                + "</a>"
                + " and "
            +"<a href=\"http://localhost/sparql2mapWidget/GoogleEarth/index.xhtml?long=" + "3" + "&lat=" + "4" + "&name=" +"Berlin"+ "\">"
            + "_Berlin_"
            + "</a>"
                + " are beautiful");
        test.done();
    };
    var onAnnotationFailed = function (e) {
        test.fail("The function failed to annotate text. Error is: " + e.message);
        test.done();
    };
    news2landsat.annotateText(
        JSON.stringify({resolvedLocations: [
            {inputName: "Paris", geoname: {longitude: 1, latitude: 2}},
            {inputName: "Berlin", geoname: {longitude: 3, latitude: 4}}
        ]
        }), "Paris and Berlin are beautiful").fail(onAnnotationFailed).then(onAnnotationSuccess);
}

exports['resolveLocationViaClavin'] = function(test){
     function onClavinReturn(geonamesText){
         test.ok(geonamesText);
         test.doesNotThrow(function(){JSON.parse(geonamesText)},"Clavin result could not be parsed in JSON.");
         var geonames =  JSON.parse(geonamesText);
         test.ok(geonames.resolvedLocations, "JSON does not contain resolvedLocations");
         test.ok(geonames.resolvedLocations, "JSON does not contain resolvedLocations");
         test.equal(geonames.resolvedLocations.length, 2);
         test.ok(geonames.resolvedLocations[0].inputName);
         test.ok(geonames.resolvedLocations[1].inputName);
         var berlinLocation;
         if(geonames.resolvedLocations[0].inputName == "Berlin")
            berlinLocation = geonames.resolvedLocations[0];
         else if(geonames.resolvedLocations[1].inputName == "Berlin")
             berlinLocation = geonames.resolvedLocations[1];
         else
            test.fail("Berlin was not returned by Clavin");
         test.equal(berlinLocation.inputName, "Berlin");
         test.equal(berlinLocation.geoname.longitude, 13.41667);
         test.equal(berlinLocation.geoname.latitude, 52.5);

         var parisLocation;
         if(geonames.resolvedLocations[0].inputName == "Paris")
             parisLocation = geonames.resolvedLocations[0];
         else if(geonames.resolvedLocations[1].inputName == "Paris")
             parisLocation = geonames.resolvedLocations[1];
         else
             test.fail("Paris was not returned by Clavin");
         test.equal(parisLocation.inputName, "Paris");
         test.equal(parisLocation.geoname.longitude, 2.3486);
         test.equal(parisLocation.geoname.latitude, 48.8534);

         test.done();
     }
     function onClavinError(e){
          test.fail("Clavin could not achieve its work. Error is: "+e);
         test.done();
     }
    news2landsat.resolveLocations("Paris and Berlin are beautiful").then(onClavinReturn).fail(onClavinError);
}

