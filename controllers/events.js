var Event = require('../models/events');


exports.insert =  function (req, res) {
    var eventData = req.body;
    try {
        var event = new Event({
            title: eventData.title,
            location: eventData.location,
            description: eventData.description,
            start_date: eventData.start_date,
            end_date: eventData.end_date
        });
        event.save(function (err, results) {
            if (err) res.status(500).send('Invalid data!')
            res.setHeader('Content-Type', 'application/json');
            response = new Response("Saved")
            res.send(JSON.stringify(response));
        });
    } catch (e) {
        console.log("500")
        res.status(500).send('error ' + e);
    }
}

exports.sync = function(req, res){
    var eventData = req.body;
    var title = eventData.title;
    var location = eventData.location;
    var description = eventData.description;
    var start_date = eventData.start_date;
    var end_date = eventData.end_date;
    var alreadystored = false
    Event.find({title: title, description:description},
        'title location description start_date end_date',
        function (err, events) {
            console.log(events)
            if (events.length == 0) {
                alreadystored = false
            }
            else{
                for (var elem of events) {
                    console.log(elem)
                    if (elem.title == title && elem.location == location && elem.start_date == start_date) {
                        alreadystored = true
                    }
                }
            }
            if (!alreadystored){
                try {
                    console.log("Storing indexedDB data into MongoDB")
                    var event = new Event({
                        title: title,
                        location: location,
                        description: description,
                        start_date: start_date,
                        end_date: end_date
                    });
                    console.log('received: ' + event);
                    response = new Response("Events backed up")
                    event.save(function (err, results) {
                        if (err){
                            console.log("err")
                            res.status(500).send('Invalid data!');

                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(response));
                    });
                } catch (e) {
                    console.log("500")
                    res.status(500).send('error ' + e);
                }
            }
            else{
                response = new Response("Events already stored or username taken")
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response));
            }
        })}

exports.get = function(req, res){
    Event.find({},
        'title location description start_date end_date',
        function (err, events) {
            console.log(events)
            res.setHeader('Content-Type', 'application/json');
            response = new Response("Saved")
            res.send(JSON.stringify(events))
        })}

exports.return = function(req, res){
    id = req.body.id
    Event.find({_id:id},
        'title location description start_date end_date',
        function (err, events) {
            console.log(events)
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(events))
        })}

class Response{
    constructor (string) {
        this.string = string;
    }
}