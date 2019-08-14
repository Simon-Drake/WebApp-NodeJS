var express = require('express');
var router = express.Router();
var user = require('../controllers/users');
var event = require('../controllers/events');

// For linux
var initDB= require('../controllers/init');
initDB.init();
// let init = require('../controllers/init');

// let init = require('../controllers/init');
// Comment out to delete events for mac
// init.init();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Log in' });

});

/* GET logout. */
router.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect("/")

});

/* GET create event. */
router.get('/create_event', function(req, res, next) {
    res.render("create_event", { title: 'Create_event' });
});


/* GET register page. */
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register' });
});

/* GET events page. */
router.get('/events', function(req, res, next) {
    res.render('events', { title: 'Events' });
});

/* GET userstory page. */
router.get('/user_story', function(req, res, next) {
    res.render('user_story', { title: 'user_Story' });
});

/* GET event page. */
router.get('/events/:id', function(req, res, next) {
    res.render('ve', { title: 'Events' });
});


// Used to return session id
router.post('/session', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(req.session.id));
});

// The following functions are used in ajax queries.
// Their functionality should be obvious from the url names
router.post('/register', user.insert);
router.post('/login', user.login);
router.post('/sync_users', user.sync);
router.post('/createEvent', event.insert);
router.post('/getEvents', event.get);
router.post('/return_event', event.return);
router.post('/sync_events', event.sync);



/**
 *
 * @param title
 * @param location
 * @param description
 * @param start_date
 * @param end_date
 * @constructor
 */
class Event{
    constructor (title, location, description, start_date, end_date) {
        this.title = title;
        this.location= location;
        this.description = description;
        this.start_date = start_date;
        this.end_date = end_date;
    }
}


module.exports = router;
