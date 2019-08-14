var mongoose = require('mongoose');
var User = require('../models/users');
var Event = require('../models/events');

exports.init= function() {

    // Event.deleteMany({}, function(err, obj) {
    //     if (err) throw err;
    //     console.log("User Collection Deleted");
    // });
    // uncomment if you need to drop the database
    //
    // User.remove({}, function(err) {
    //    console.log('collection removed')
    // });
    // Event.remove({}, function(err) {
    //     console.log('collection removed')
    // });

    // var user = new User({
    //     username: 'Mickey',
    //     password: 'Mouse',
    //     date: new Date()
    // });
    // user.save(function (err, results) {
    //     console.log(results._id);
    //     console.log("Dummy instance added to check its working")
    // });
}


