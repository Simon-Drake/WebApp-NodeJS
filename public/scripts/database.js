////////////////// DATABASE //////////////////
var dbPromise;


const USER_DB_NAME = 'db_user_1';
const USERS_STORE_NAME = "store_users";
const LOGGED_STORE_NAME = "store_logged";
const EVENTS_STORE_NAME = "store_events";
const USERSTORY_STORE_NAME = "store_userstories";
const PHOTO_NAME = "store_photos";


/**
 * Initialises the database
 */
function initDatabase(){
    dbPromise = idb.openDb(USER_DB_NAME, 1, function (upgradeDb) {
        if (!(upgradeDb.objectStoreNames.contains(PHOTO_NAME)) && !(upgradeDb.objectStoreNames.contains(USERSTORY_STORE_NAME)) && !(upgradeDb.objectStoreNames.contains(EVENTS_STORE_NAME)) && !(upgradeDb.objectStoreNames.contains(USERS_STORE_NAME)) && !(upgradeDb.objectStoreNames.contains(LOGGED_STORE_NAME))) {
            var userDB = upgradeDb.createObjectStore(USERS_STORE_NAME, {keyPath: 'id', autoIncrement: true, unique: true});
            var loggedDB = upgradeDb.createObjectStore(LOGGED_STORE_NAME, {keyPath: 'id', autoIncrement: true, unique: true});
            var eventsDB = upgradeDb.createObjectStore(EVENTS_STORE_NAME, {keyPath: 'id', autoIncrement: true});
            var userstoryDB = upgradeDb.createObjectStore(USERSTORY_STORE_NAME, {keyPath: 'id', autoIncrement: true});
            var photoDB = upgradeDb.createObjectStore(PHOTO_NAME, {keyPath: 'id', autoIncrement: true});
        }
    });
}

/**
 * it saves the user in db
 * @param username
 * @param userObject
 */
function storeCachedUserData(username, userObject, STORE_NAME) {
    if (dbPromise) {
        dbPromise.then(async db => {
            var tx = db.transaction(STORE_NAME, 'readwrite');
            var store = tx.objectStore(STORE_NAME);
            await store.put(userObject);
            return tx.complete;
        }).then(function () {
            console.log('added user to the store! ' + JSON.stringify(userObject));
            if (STORE_NAME == USERS_STORE_NAME) {
                completedRegister()
            }
        }).catch(function (error) {
            alert("You are already registered")
        });
    } else localStorage.setItem(username, JSON.stringify(userObject));
}

/**
 * Saves event in database
 * @param title
 * @param eventObject
 */
function storeCachedEventData(title, eventObject) {
    console.log(eventObject)
    console.log("storing")
    if (dbPromise) {
        dbPromise.then(async db => {
            var tx = db.transaction(EVENTS_STORE_NAME, 'readwrite');
            var store = tx.objectStore(EVENTS_STORE_NAME);
            await store.put(eventObject);
            return tx.complete;
        }).then(function () {
            console.log('added user to the store! ' + JSON.stringify(eventObject));
            alert("event created successfully")
            accessEventsPage();
        }).catch(function (error) {
            console.log(error)
        });
    } else {
        localStorage.setItem(title, JSON.stringify(eventObject));
    }
}

/**
 * Saves photo in database
 * @param photo
 */
function savePhoto(photo){
    if (dbPromise) {
        dbPromise.then(async db => {
            var tx = db.transaction(PHOTO_NAME, 'readwrite');
            var store = tx.objectStore(PHOTO_NAME);
            await store.put(photo);
            return tx.complete;
        }).then(function () {
            console.log('added photo to the store! ' + JSON.stringify(photo));
        }).catch(function (error) {
            console.log(error)
        });
    } else {
        localStorage.setItem(photo, JSON.stringify(photo));
    }
}

/**
 * Reads photo from database
 * @param title
 * @param event
 * @param description
 */
function readInPhoto(title, event, description){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(PHOTO_NAME, 'readonly');
            var store = tx.objectStore(PHOTO_NAME);
            return store.getAll();
        }).then(function (readingsList) {
            if (readingsList.length > 0) {
                console.log(readingsList[readingsList.length - 1])
                createStory(title, event, description, readingsList[readingsList.length - 1])
            }
        })
    } else {
        console.log("Could not find dbpromise")
    }
}

/**
 * Stores userstory
 * @param title
 * @param userstoryObject
 */
function storeCachedUserStoryData(title, userstoryObject) {
    if (dbPromise) {
        dbPromise.then(async db => {
            var tx = db.transaction(USERSTORY_STORE_NAME, 'readwrite');
            var store = tx.objectStore(USERSTORY_STORE_NAME);
            await store.put(userstoryObject);
            return tx.complete;
        }).then(function () {
            console.log('added userstory to the store! ' + JSON.stringify(userstoryObject));
            alert("userstory created successfully")
            accessEventsPage();
        }).catch(function (error) {
            console.log(error)
        });
    } else {
        localStorage.setItem(title, JSON.stringify(userstoryObject));
    }
}

/**
 * Adds user story to event page
 * @param id
 */
function addUserStories(id){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(USERSTORY_STORE_NAME, 'readonly');
            var store = tx.objectStore(USERSTORY_STORE_NAME);
            return store.getAll();
        }).then(function (readingsList) {
            if (readingsList.length>0) {
                for (var elem of readingsList) {
                    if (elem.event == id) {
                        addToUSResults(elem)
                    }
                }
            }
        });
    } else {
        console.log("Could not find dbpromise")
    }
}

/**
 * Checks if user is logged in to redirect from homepage
 * @param username
 * @param date
 * @returns {*}
 */
function checkUser(user) {
    console.log(dbPromise)
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(USERS_STORE_NAME, 'readonly');
            var store = tx.objectStore(USERS_STORE_NAME);
            // var index = store.index('user');
            return store.getAll();
        }).then(function (readingsList) {
            if (readingsList.length>0) {
                var logical_output = false;
                for (var elem of readingsList) {
                    if (elem.username == user.username && elem.password == user.password) {
                        storeCachedUserData(user.username, user, LOGGED_STORE_NAME);
                        accessEventsPage();
                        logical_output = true;
                    }

                    if ((elem.username == user.username) && !(elem.password == user.password)) {
                        alert("wrong password");
                        logical_output = false;
                    }
                }
                if (!logical_output) alert("login failed")
            }
            else{
                alert("you are not registered")
            }

        });
    } else {
        console.log("Could not find dbpromise")
    }
}

/**
 * Checks if user is logged in to redirect
 * @param session
 */
function loggedIn(session){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(LOGGED_STORE_NAME, 'readonly');
            var store = tx.objectStore(LOGGED_STORE_NAME);
            // var index = store.index('user');
            return store.getAll();
        }).then(function (readingsList) {
            if (readingsList.length>0) {
                var logical_output = false;
                for (var elem of readingsList){
                    if (elem.session == session) {
                        accessEventsPage();
                        break;
                    }
                }
            }
        });
    } else {
        console.log("Could not find dbpromise")
    }
}

/**
 * Checks if user is stored
 * @param username
 * @param user
 * @param store_name
 */
function checkUserStored(username, user, store_name){
    if (dbPromise) {
        console.log("pass")
        dbPromise.then(function (db) {
            var tx = db.transaction(USERS_STORE_NAME, 'readonly');
            var store = tx.objectStore(USERS_STORE_NAME);
            // var index = store.index('user');
            return store.getAll();
        }).then(function (readingsList) {
            stored = false
            if (readingsList.length>0) {
                for (var elem of readingsList){
                    console.log(elem)
                    if (elem.username == user.username && elem.password == user.password) {
                        alert("already registered")
                        stored = true;
                        break;
                    }
                    if (elem.username == user.username && !(elem.password == user.password)) {
                        alert("username already taken")
                        stored = true;
                        break;
                    }
                }
                console.log(stored)
                if (!stored){
                    storeCachedUserData(username, user, store_name)
                }
            }
            else{
                storeCachedUserData(username, user, store_name)
            }
        });
    } else {
        console.log("Could not find dbpromise")
    }
}

/**
 * Syncs users from indexeddb to mondogb
 */
function syncUsers(){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(USERS_STORE_NAME, 'readonly');
            var store = tx.objectStore(USERS_STORE_NAME);
            return store.getAll();
        }).then(function (readingsList) {
            if (readingsList.length>0) {
                sync(readingsList, "users")
            }
        });
    } else {
        console.log("Could not find dbpromise")
    }
}

/**
 * Syncs events from indexeddb to mongodb
 */
function syncEvents(){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(EVENTS_STORE_NAME, 'readonly');
            var store = tx.objectStore(EVENTS_STORE_NAME);
            return store.getAll();
        }).then(function (readingsList) {
            if (readingsList.length>0) {
                sync(readingsList, "events")
            }
        });
    } else {
        console.log("Could not find dbpromise")
    }
}

/**
 * Reads in events to display them  on event page
 * @param title
 * @param location
 * @param date
 */
function displayEvents(title, location, date){
    if (dbPromise) {
        dbPromise.then(function (db) {
            var tx = db.transaction(EVENTS_STORE_NAME, 'readonly');
            var store = tx.objectStore(EVENTS_STORE_NAME);
            // var index = store.index('user');
            return store.getAll();
        }).then(function (readingsList) {
            subDisplayEvents(readingsList, 1, title, location, date)
            console.log(readingsList)
        });
    } else {
        console.log("Could not find dbpromise")
    }
}