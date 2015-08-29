var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var http = require('http');
var AlexaSkill = require('./AlexaSkill');

var BusTimes = function () {
    AlexaSkill.call(this, APP_ID);
};

BusTimes.prototype = Object.create(AlexaSkill.prototype);
BusTimes.prototype.constructor = BusTimes;

BusTimes.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("BusTimes onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

BusTimes.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("BusTimes onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleBusRequest(response);
};

BusTimes.prototype.intentHandlers = {
    GetBusTimesIntent: function (intent, session, response) {
        handleBusRequest(response);
    },

    HelpIntent: function (intent, session, response) {
        response.ask("You can ask Bus Times when the bus is coming, or, you can say exit... What can I help you with?");
    }
};

function handleBusRequest(response) {
    makeNextBusRequest("sf-muni", 15613, function nextBusRequestCallback(err, nextBusResponse) {
        var speechOutput;

        if (err) {
            speechOutput = "Sorry, the Next Bus service is experiencing a problem. Please try again later";
        } else {
            speechOutput = "The next buses are " + nextBusResponse;
        }

        response.tellWithCard(speechOutput, "BusTimes", speechOutput)
    });
}

/**
 * Uses NextBus API, currently agency and stop ID are hardcoded.
 * Get agency name from: http://webservices.nextbus.com/service/publicXMLFeed?command=agencyList
 * For SF Muni, get stop ID from: http://www.nextbus.com/wirelessConfig/stopNumbers.jsp?a=sf-muni
 */
function makeNextBusRequest(agency, stopId, nextBusRequestCallback) {

    var endpoint = 'http://webservices.nextbus.com/service/publicXMLFeed';
    var queryString = '?command=predictions&a=' + agency + '&stopId=' + stopId;

    http.get(endpoint + queryString, function (res) {
        var nextBusResponseString = '';

        res.on('data', function (data) {
            nextBusResponseString += data;
        });

        res.on('end', function () {
            var data = []
            var parseString = require('xml2js').parseString;
            var nextBusResponseObject = parseString(nextBusResponseString, function (err, result) {
                for(var i = 0; i < result.body.predictions.length; i++) {
                    var currPredictions = result.body.predictions[i];
                    if (currPredictions.direction != undefined) {
                        for (var j = 0; j < currPredictions.direction.length; j++) {
                            for (var k = 0; k < currPredictions.direction[j].prediction.length; k++) {
                                var dict = {};
                                dict["route"] = currPredictions.$.routeTitle;
                                dict["minutes"] = Number(currPredictions.direction[j].prediction[k].$.minutes);
                                data[data.length] = dict;
                            }
                        }
                    }
                }

                // Sort by arrival times
                data.sort(function(a, b) {
                    if (a["minutes"] < b["minutes"]) return -1;
                    if (a["minutes"] > b["minutes"]) return 1;
                    return 0;
                });
            });

            if (nextBusResponseObject.error) {
                console.log("NextBus error: " + nextBusResponseObject.error.message);
                nextBusRequestCallback(new Error(nextBusResponseObject.error.message));
            } else {
                nextBusRequestCallback(null, convertDataToString(data));
            }
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        nextBusRequestCallback(new Error(e.message));
    });
}

function convertDataToString(data) {
    var string = ""
    var n = Math.min(data.length, 3)
    for (var i = 0; i < n; i++) {
        string += data[i]["route"] + " in " + data[i]["minutes"] + (data[i]["minutes"] == 1 ? " minute" : " minutes")
        if (i < (n - 1)) {
            string += ", "
            if (i == (n - 2)) {
                string += "and "
            }
        } else {
            string += "."
        }
    }
    return string
}

exports.handler = function (event, context) {
    var busTimes = new BusTimes();
    busTimes.execute(event, context);
};

