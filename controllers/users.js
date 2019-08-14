var User = require('../models/users');
var url = "mongodb://localhost:27017/";

exports.sync = function(req, res){
    var userData = req.body;
    var username = userData.username;
    var password = userData.password;
    var alreadystored = false
    User.find({username: username, password: password},
        'username password date',
        function (err, users) {
            if (users.length == 0) {
                alreadystored = false
            }
            else{
                for (var elem of users) {
                    console.log(elem)
                    if (elem.username == username && elem.password == password) {
                        alreadystored = true
                    }
                    if (elem.username == username && !(elem.password == password)) {
                        alreadystored = true
                    }
                }
            }
            if (!alreadystored){
                try {
                    console.log("Storing indexedDB data into MongoDB")
                    var user = new User({
                        username: userData.username,
                        password: userData.password,
                        date: new Date()
                    });
                    console.log('received: ' + user);
                    response = new Response("Users backed up")

                    user.save(function (err, results) {
                        if (err)
                            res.status(500).send('Invalid data!');

                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(response));
                    });
                } catch (e) {
                    console.log("500")
                    res.status(500).send('error ' + e);
                }
            }
            else{
                response = new Response("User already stored or username taken")
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response));
            }
        })}

        // Function that inserts a user to mongoDb, it checks if already registered
// or username is taken.
exports.insert =  function (req, res) {
    var userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
        console.log("no data")
    }
    var username = userData.username;
    var password = userData.password;
    User.find({username: username},
        'username password date',
        function (err, users) {
            var response = new Response("Register successful")
            if (users.length == 0) {
                response = new Response("Register successful")

            }
            else{
                for (var elem of users) {
                    console.log(elem)
                    if (elem.username == username && elem.password == password) {
                        response = new Response("Already registered")
                    }
                    if (elem.username == username && !(elem.password == password)) {
                        response = new Response("Username taken")
                    }
                }
            }
            if (response.string == "Register successful"){
                console.log("User data good, storing user...")
                try {
                    var user = new User({
                        username: userData.username,
                        password: userData.password,
                        date: new Date()
                    });
                    console.log('received: ' + user);

                    user.save(function (err, results) {
                        if (err)
                            res.status(500).send('Invalid data!');

                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(response));
                    });
                } catch (e) {
                    console.log("500")
                    res.status(500).send('error ' + e);
                }
            }
            else{
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response));
            }
    });
}

// Checks data for login
exports.login =  function (req, res) {
    var userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
        console.log("no data")
    }
    console.log(userData)
    var username = userData.login;
    var password = userData.password;
    console.log(username)
    console.log(password)
    User.find({username: username},
        'username password date',
        function (err, users) {
            console.log("gets to controller")
            if (users.length == 0) {
                response = new Response("Not registered")
            }
            else{
                for (var elem of users) {
                    console.log(elem)
                    if (elem.username == username && elem.password == password) {
                        response = new Response("Successful login")
                    }
                    if (elem.username == username && !(elem.password == password)) {
                        response = new Response("Wrong password")
                    }
                }
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(response));
        });
}

class Response{
    constructor (string) {
        this.string = string;
    }
}