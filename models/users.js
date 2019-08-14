var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var User = new Schema(
    {
        username: {type: String, required: true, max: 100},
        password: {type: String, required: true, max: 100},
        date: {type: Date}
    }
);


User.set('toObject', {getters: true});


var userModel = mongoose.model('User', User );

module.exports = userModel;