var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Event = new Schema(
    {
        title: {type: String, max: 100},
        location: {type: String, max: 100},
        description: {type: String, max: 100},
        start_date: {type: Date},
        end_date: {type: Date}
    }
);

Event.set('toObject', {getters: true});

var eventModel = mongoose.model('Event', Event );

module.exports = eventModel;
