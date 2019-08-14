/**
 * Global variables
 * @type {boolean}
 * @type {string}
 */
var offline = false;
var lostconnection = false;
var sessionid;

/**
 * Initialises event app, registers service worker.
 * Initialises Indexeddb database
 * Takes a string depending on the page we're on to perform page specific tasks.
 * @param string
 */
function initEventApp(string) {
    //Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () {
                console.log('Service Worker Registered');
            })
            .catch (function (error){
                console.log('Service Worker NOT Registered '+ error.message);
            });
    }

    // Check for indexeddb support and initialises database
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    // Specific tasks to do depending on the page
    if (string == 'login_register') {
        sendAjaxQuery( '/session', {}, 6)
    }
    if (string == 'event') {
        searchysercher();
        displayMarkers();
    }
    if (string == "view_event") displayEvent()
}


/**
 * Function to send ajax queries.
 * Takes a code to decide which task it performs on successful return
 * @param url
 * @param data
 * @param code
 */
function sendAjaxQuery(url, data, code) {
    $.ajax({
        url: url ,
        data: data,
        dataType: 'json',
        type: 'POST',
        success: function (dataR) {
            switch (code) {
                case 0:
                    registerReturn(dataR)
                    break;
                case 1:
                    loginReturn(dataR)
                    break;
                case 2:
                    console.log("Users backed up.")
                    break;
                case 3:
                    subDisplayEvents(dataR, 0, document.getElementById("title").value, document.getElementById("location").value, new Date(document.getElementById("date").value))
                    break;
                case 4:
                    console.log("Events backed up.")
                    break;
                case 5:
                    addToResults(dataR[0], 0)
                    addUserStories(dataR[0]._id)
                    break;
                case 6:
                    setSession(dataR)
                    loggedIn(dataR)
                    break;
                case 7:
                    initMapViewEvents(dataR);
            }
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}

/**
 * Checks the users username and password.
 * If the app is offline it uses indexeddb otherwise it uses mongodb.
 * We are aware of the security risks this presents it is more to show that we
 * can create functionality using both databases depending on network capabilities.
 * Adds a session id to check if the user is logged in
 * @returns {boolean}
 */
function onSubmit() {
    offline = getoffline()

    if (offline){
        console.log("we are offline so we check indexed")
        const user = new LoggedUser(document.getElementById("login").value, document.getElementById("password").value, sessionid);
        checkUser(user)
    }
    else{
        console.log("we are online we check mongo")
        var formArray= $("form").serializeArray();
        var data={};
        for (index in formArray){
            data[formArray[index].name]= formArray[index].value;
        }
        console.log(data)
        url = "/login"
        console.log(data)
        sendAjaxQuery(url, data, 1);
    }
    return false
}

/**
 * Check if the user is already registered or
 * if the username has already been used
 * Uses either mongodb or indexeddb depending on the connection
 * @returns {boolean}
 */
function onSubmitRegister() {

    offline = getoffline()

    //IndexedDB section stores when offline
    if (offline){
        console.log("since we are offline we store in indexeddb")
        alert("We are offline, we will store the data in mongodb when we are back online")
        const user = new User(document.getElementById("username").value, document.getElementById("password").value, new Date());
        checkUserStored(user.username, user, "store_users");
    }
    else {
        // MongoDB section stores when online
        console.log("we are online we store in mongodb")
        var formArray= $("form").serializeArray();
        var data={};
        for (index in formArray){
            data[formArray[index].name]= formArray[index].value;
        }
        console.log(data)
        url = "/register"
        console.log(data)
        sendAjaxQuery(url, data, 0);
    }
    return false
}

/**
 * Creates and stores an event with a title, location, description, start and end date
 * If offline we store on indexeddb
 * If online we store on mongodb
 */
function createE(){
    offline = getoffline()
    if (offline){
        console.log("we are offline we store on indexeddb")
        const title = document.getElementById("title").value
        const location = document.getElementById("location").value
        const description = document.getElementById("description").value
        const start_date = document.getElementById("start_date").value
        const end_date = document.getElementById("end_date").value
        event = new Event(title, location, description, new Date(start_date), new Date(end_date))
        storeCachedEventData(event.title, event)
        window.location.href = "https://localhost:3001/events";
    }
    else{
        // MongoDB section stores when online
        console.log("we are online we store in mongodb")
        var formArray= $("form").serializeArray();
        var data={};
        for (index in formArray){
            data[formArray[index].name]= formArray[index].value;
        }
        console.log(data)
        url = "/createEvent"
        console.log(data)
        sendAjaxQuery(url, data, 3);
    }
}

/**
 * Function is called after a succesful ajax request to check mongodb
 * Checks for a successful login, if successful, stores the user details and sends to events page
 * calls a function in database.js when successful for data storage
 * @param dataR login success or failure response
 */
function loginReturn(dataR){
    console.log(dataR)
    if(dataR.string == "Successful login"){
        const user = new LoggedUser(document.getElementById("login").value, document.getElementById("password").value, sessionid);
        storeCachedUserData(user.username, user, LOGGED_STORE_NAME);
        accessEventsPage();
    }
    else{
        alert(dataR.string)
    }
}

/**
 * Checks for a successful user registration, if successful calls completedRegister function
 * if unsuccessful and the user already exists, alert this to the user
 * @param dataR registration success or failure response
 */
function registerReturn(dataR){
    if(dataR.string == "Register successful"){
        completedRegister()
    }
    else if (dataR.string == "Already registered"){
        alert("Already registered")
    }
    else{
        alert("Username taken")
    }
}

/**
 * Creates a user story.
 * Uses the url to get the event id.
 * Uses a helper function to take in the photo
 */
function createUserStory(){
    const title = document.getElementById("title").value
    const event = getid()
    const description = document.getElementById("description").value
    readInPhoto(title, event, description)
}

/**
 * Once the photo has been read from the file. We create and store the user story.
 * @param title
 * @param event
 * @param description
 * @param photo
 */
function createStory(title, event, description, photo){
    userstory = new UserStory(title, event, description, photo)
    storeCachedUserStoryData(userstory.title, userstory)
}

/**
 * Function to display events.
 * Takes a code depending on whether the events were read in from indexeddb or mongodb
 * @param event
 * @param code
 */
function addToResults(event, code) {
    // console.log(event);
    if (document.getElementById('results') != null) {
        const row = document.createElement('div');
        if (code == 0){
            str = '/events/' + event._id;
        }
        else{
            str = '/events/' + event.id;
        }
        document.getElementById('results').appendChild(row);
        row.innerHTML = "<div class='card-block'>" +
            "<div class=\"table table-responsive table-bordered table-hover align-items-center mx-auto\" id=\"results\" style=\"text-align: center\">" +
               "<table>" +
                    "<thead>" +
                       "<th>Title</th>" +
                       "<th>Location</th>" +
                       "<th>Description</th>" +
                       "<th>Starting Date</th>" +
                       "<th>Ending Date</th>" +
                    "</thead>" +
                    "<tr>" +
                        "<td>"+ event.title + "</td>" +
                        "<td>"+ event.location + "</td>" +
                        "<td>"+ event.description + "</td>" +
                        "<td>"+ event.start_date + "</td>" +
                        "<td>"+ event.end_date + "</td>" +
                        "<td><a href="+ str + ">View event</a></td>" +
                    "</tr>" +
                "</table>" +
            "</div>"
    }
}

/**
 * Similar to the previous message but takes a user story and dislays an image.
 * @param userstory
 */
function addToUSResults(userstory) {
    data = userstory.photo.data
    if (document.getElementById('results') != null) {
        const row = document.createElement('div');
        document.getElementById('results_us').appendChild(row);
        row.innerHTML = "<div class='card-block'>" +
            "<div class=\"table table-responsive table-bordered table-hover align-items-center mx-auto\" id=\"results\" style=\"text-align: center\">" +
                "<table width='100%' "+ ">" +
                    "<thead>" +
                        "<th>Title</th>" +
                        "<th>Description</th>" +
                        "<th>Photo</th>" +
                    "</thead>" +
                    "<tr>" +
                        "<td>"+ userstory.title + "</td>" +
                        "<td>"+ userstory.description + "</td>" +
                        "<td><img id='photo' src="+ data + "></td>" +
                    "</tr>" +
                "</table>" +
            "</div>"

    }
}

/**
 * Function used to clear HTML when needed
 */
function clearResults() {
    var Parent = document.getElementById('results');
    while(Parent.hasChildNodes())
    {
        Parent.removeChild(Parent.firstChild);
    }
}

/**
 * Displays an event on events page
 */
function displayEvent() {
    id = getid()
    // getEvent(parseInt(id, 10))
    sendAjaxQuery('/return_event', {id}, 5 )

}

/**
 * Function to get the id from the url
 * @returns {string | *}
 */
function getid(){
    x = window.location.href.split("/")
    id = x[x.length-1]
    if (id.includes('?')){
        id = id.split('?')[0]
    }
    return id
}

/**
 * Search function for events.
 * Uses either mongodb or indexeddb depending on connection.
 * @returns {boolean}
 */
function searchysercher() {
    clearResults();
    offline = getoffline()
    if (offline){
        const title = document.getElementById("title").value;
        const location = document.getElementById("location").value;
        const date = new Date(document.getElementById("date").value);
        displayEvents(title, location, date);
    }
    else{
        data = {}
        url = "/getEvents"
        sendAjaxQuery(url, data, 3);
    }
    return false
}

/**
 * Helper function to display events
 * @param readingList
 * @param code
 * @param title
 * @param location
 * @param date
 */
function subDisplayEvents(readingList, code,  title, location, date){
    if (readingList.length>0) {
        if (title == "" && location == "" && isValidDate(date) == false) {
            for (var elem of readingList) {
                addToResults(elem, code)
            }
        }
        else {
            for (var elem of readingList) {
                var bool = searchEventsHelper(title, location, date, elem)
                if (bool) addToResults(elem, code)
            }
        }
    }
}

/**
 * Helper function.
 * @param d
 * @returns {boolean}
 */
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

/**
 * Function that returns a boolean if the event fits the parameters.
 * @param title
 * @param location
 * @param date
 * @param elem
 * @returns {boolean}
 */
function searchEventsHelper(title, location, date, elem) {
    if (title.toUpperCase() == elem.title.toUpperCase()) {
        return true
    }
    else if (location == elem.location) {
        return true
    }
    else if (date >= elem.start_date && date <= elem.end_date) {
        return true
    }
    else {
        return false
    }
}


/**
 * Syncs databases when the connection has been lost and reconnects
 */
function syncDatabases(){
    console.log("syncing db")
    syncEvents()
    syncUsers()
}

/**
 * Sync databases takes indexeddb stores and add them to mongodb
 * @param r
 * @param s
 */
function sync(r, s){
    if (s=="users"){
        url = "/sync_users"
        for (elem of r){
            sendAjaxQuery(url, elem, 2);
        }
    }
    else{
        url = "/sync_events"
        for (elem of r){
            sendAjaxQuery(url, elem, 4);
        }
    }
}

// Getters and setters
/**
 * Set offline
 * @param b
 */
function setoffline(b){
    offline = b
}

/**
 * get offline
 * @returns {string}
 */
function getoffline(){
    return offline;
}

/**
 * set lostconnection
 * @param b
 */
function setlostconnection(b){
    lostconnection = b
}

/**
 * get lostconnection
 * @returns {boolean}
 */
function getlostconnection(){
    return lostconnection;
}

/**
 * Set the session id
 * @param data Session id
 */
function setSession(data){
    sessionid = data
}

// The following functions are used to redirect

/**
 * Redirects the user to the home page (login) if a successful registration has occured
 */
function completedRegister(){
    window.location.href = "https://localhost:3001/";
    window.location.href = "https://localhost:3001/";
    alert("register successful")
}


/**
 * Sends user to the events page
 */
function accessEventsPage(){
    window.location.href = "https://localhost:3001/events";
}

/**
 *
 * @param title of user story
 * @param location of user story
 * @param description of user story
 * @param start_date of user story
 * @param end_date of user story
 * @constructor creates the user story
 */
class UserStory{
    constructor (title, event, description, photo) {
        this.title = title;
        this.event= event;
        this.description = description;
        this.photo = photo;
    }
}


// Class definitions
/**
 *
 * @param title of event
 * @param location of event
 * @param description of event
 * @param start_date of event
 * @param end_date of event
 * @constructor creates the event
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


/**
 * @param username current users username
 * @param password current users password
 * @param session current session id
 * @constructor creates the logged in user
 */
class LoggedUser{
    constructor (username, password, session) {
        this.username= username;
        this.password = password;
        this.session = session
    }
}

/**
 * @param username the username
 * @param password the password
 * @param date the date
 * @constructor creates the user
 */
class User{
    constructor (username, password, date) {
        this.username= username;
        this.date= date;
        this.password = password;
    }
}

//Event listeners

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("passing here")
    setoffline(true)
    setlostconnection(true)
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning, checks if the user previously
 * lost connecion, if so it syncs the databases
 */
window.addEventListener('online', function(e) {
    // Resync data with server.
    setoffline(false)
    hideOfflineWarning();
    lostconnection = getlostconnection()
    // If the user lost connection sync the databases
    if (lostconnection ){
        syncDatabases()
        setlostconnection(false)
    }

    console.log("You are online");

}, false);

/**
 * Display user story form
 */
function displayUserStoryForm(){
    if (document.getElementById('user_story')!=null)
        document.getElementById('user_story').style.display='block';
}

/**
 * Display a warning to the user when they are not connected to the internet
 */
function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

/**
 * Don't display a warning to the user when they are not connected to the internet
 */
function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}

/**
 * Displays a map used for searching and creating events on both the events and create event page
 * centres the map at a location for initial display
 */
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: {lat: -34.397, lng: 150.644}
    });
    var geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function() {
        geocodeAddress(geocoder, map);
    });
}

/**
 * Displays the address marker on the map on the Event and create event form, called by initMap
 * @param geocoder finds address for marker placement
 * @param resultsMap updated map with marker
 */
function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('location').value;
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function initMapViewEvents(readingsList) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: {lat: -34.397, lng: 150.644}
    });
    var geocoder = new google.maps.Geocoder();

    if (readingsList != null) {
        for (elem of readingsList) {
            console.log(elem.location)
            var address = elem.location
            geocoder.geocode({'address': address}, function (results, status) {
                if (status === 'OK') {
                    map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    // alert(results[0].geometry.location)
                }
            });
        }
    }

    document.getElementById('submit').addEventListener('click', function() {
        var area = document.getElementById('location').value;
        geocoder.geocode({'address': area}, function (results, status) {
            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
            }
        });
    });

}

function displayMarkers(){
    data = {}
    url = "/getEvents"
    sendAjaxQuery(url, data, 7);
}

