/*
 * @fileOverview Provides a wrapper for all required interactions with the database, as well as initializing the database on startup. Utilizes the package node-sqlite3.
 * @author Brent Glowinski
 */
const MEDIUM_LENGTH = 16777215;
const TEXT_LENGTH = 65535;
const TINY_LENGTH = 255;

var sqlite = require("../node_modules/sqlite3/sqlite3");
var db = new sqlite.Database("MediTalk.db");
db.serialize();
// --- USER TABLE ---
// id | username | password | email | lastSession | firstName | lastName | flags
db.run("CREATE TABLE IF NOT EXISTS Users ( id INTEGER PRIMARY KEY, username TINYTEXT, password TEXT, email TINYTEXT, lastSession DATETIME, firstName TINYTEXT, lastName TINYTEXT, flags INTEGER)");
// --- SECTIONS TABLE ---
// id | parent | secID | name | description | postCount | watchers
db.run("CREATE TABLE IF NOT EXISTS Sections ( id INTEGER PRIMARY KEY, parent TINYTEXT, name TINYTEXT, description TEXT, postCount INTEGER, watchers MEDIUMTEXT)");
/// --- POSTS TABLE ---
// id | type | title | content | author | secid | postTime | votes | comments | watchers
db.run("CREATE TABLE IF NOT EXISTS Posts ( id INTEGER PRIMARY KEY, type INTEGER, title TEXT, content TEXT, author TINYTEXT, secID TINYTEXT, postTime DATETIME, votes INTEGER, comments INTEGER, watchers MEDIUMTEXT)");
// --- COMMENTS TABLE ---
// id | post | parent | content | author | postTime | votes
db.run("CREATE TABLE IF NOT EXISTS Comments ( id INTEGER PRIMARY KEY, post INTEGER, parent INTEGER, content TEXT, author INTEGER, postTime DATETIME, votes INTEGER)");
// --- DOCUMENTS ---
// id | location | size | uploadTime | uploader
db.run("CREATE TABLE IF NOT EXISTS Documents ( id INTEGER PRIMARY KEY, location TEXT, size INTEGER, uploadTime DATETIME, uploader INTEGER)");

/*
 * Inserts a new post in to the database based on the parameters passed in.
 * @param type		Type of post; 0 for text, 1 for link, 2 for document.
 * @param title		Title of the post
 * @param content	Contents of the post. Can be text, a URL, or the location of a document on the server
 * @param author	The author of the post
 * @param secid		The section the post is associated with
 * @return			True if post has the right length; false if it doesn't.
 */
var newPost = function (type, title, content, author, secid) {
	if((content.length < TEXT_LENGTH) && (title.length < TINY_LENGTH)) {
		db.run("INSERT INTO Posts (type, title, content, author, secID, postTime, votes, comments, watchers) VALUES ($type, $title, $content, $author, $secid, CURRENT_TIMESTAMP, 0, 0, '')", 
			   { $type: type, $title: title, $content: content, $author: author, $secid: secid });
		return true;
	} else return false;
}

/*
 * Gets the post in the database corresponding to the specified ID and passes it in to a callback.
 * @param id 		The ID of the post to be returned
 * @param callback	Once the row is read from the database, an object representing all the parts of the post is passed in to the callback.
 */
var getPost = function(id, callback) {
	db.get("SELECT * FROM Posts WHERE id = ?", id, function(err, row) {
		if(err) throw err;
		callback(row)
	});
}

/*
 * Inserts a new user into the database.
 * @param username		Pseudonym the user will be identified with
 * @param password		Hashed password associated with the user
 * @param email			The email used to log in to the system with and be notified of important things with
 * @param firstName		First name of the user
 * @param lastName		Last name of the user
 */
var newUser = function(username, password, email, firstName, lastName, flags) {
	db.get("SELECT * from Users WHERE username = ?", username, function(err, row) {
		if(err) throw err;
		else if (row === undefined) { 
			db.run("INSERT INTO Users (username, password, email, firstName, lastName, lastSession, flags) VALUES ($user, $pass, $email, $first, $last, CURRENT_TIMESTAMP, $flags)", 
		   		{ $user: username, $pass: password, $email: email, $first: firstName, $last: lastName, $flags: flags });
		}
	});
}

/*
 * Deletes a user from the database by id.
 * @param id 			ID of the user to be deleted.
 */
var delUser = function(name) {
	db.run("DELETE FROM Users WHERE username = ?", name);
}

/*
 * Gets the user's password out of the database, then checks it against the provided password and passes the resulting boolean into a callback.
 * @param username		The username that the function is checking the password for
 * @param password		Password to be forwarded into the callback
 * @param callback		Function to handle data that has been checked in the database.
 				Arguments for callback - auth : boolean
 							 userId : int
 							 userFlag : int
 * @param password		Password to be checked
 * @param callback		Function that takes a boolean as input. True if passwords the same, false otherwise.
 */
var verifyUser = function(username, password, callback) {
	db.get("SELECT id, password, flags FROM Users WHERE username = ?", username, function(err, row) {
		if(err) throw err;
		if (row == undefined) {
			callback(false);
		} else {		
			callback(password  == row.password, row.id, row.flags);
		}
	});
}

/*
 * Checks whether a user is in the database.
 * @param username		Username of user to be checked
 * @param callback		Callback that takes a boolean as input. True if user exists, false otherwise.
 */
var doesUserExist = function(username, callback) {
	db.get("SELECT * from Users WHERE username = ?", username, function(err, row) {
		if(err) throw err;
		else callback(!(row === undefined));
	});
}

/*
 * Gets the username of the user along with some miscellaneous information and passes it all in to a callback function.
 * @param name			Username of the user
 * @param callback		Callback that takes the object containing all the data as input. Contents: username, email, lastSession, firstName, lastName
 */
var getUser = function(name, callback) {
	db.get("SELECT username, email, lastSession, firstName, lastName FROM Users WHERE username = ?", name, function(err, row) {
		if(err) throw err;
		callback(row);
	});
}

/*
 * Gets information on all users and returns it to the callback.
 * @param callback		Callback that takes the object containing all the data as input. Contents: username, email, lastSession, firstName, lastName
 */
var getAllUsers = function(callback) {
	db.all("SELECT username, email, firstName, lastName FROM Users", function(err, rows) {
		if(err) throw err;
		callback(rows);
	});
}

/*
 * Inserts a new section in to the database.
 * @param parent 		The ID of the parent of the section. 0 if there is no parent.
 * @param name			Name of the section
 * @param description	Brief description of the section
 */
var newSection = function(parent, name, description) {
	db.run("INSERT INTO Sections (parent, name, description, postCount, watchers) VALUES ($parent, $name, $desc, 0, '')",
		   { $parent: parent, $name: name, $desc: description });
}

/*
 * Checks whether a section is in the database.
 * @param name			Name of the section to be checked
 * @param callback		Callback that takes a boolean as input. True if section exists, false otherwise.
 */
var doesSectionExist = function(name, callback) {
	db.get("SELECT * from Sections WHERE name = ?", name, function(err, row) {
		if(err) throw err;
		else callback(!(row === undefined));
	});
}

/*
 * Deletes a section from the database corresponding to an integer ID.
 * @param id	ID of section to be deleted.
 */
var delSection = function(id) {
	db.run("DELETE FROM Sections WHERE id = ?", id);
}

/*
 * Gets the titles of all sections.
 * @param callback	Callback function that takes an object containing all information about the section as input.
 */
var getAllSections = function(callback) {
	db.all("SELECT name FROM Sections", function(err, rows) {
		if (err) throw err;
		callback(rows);
	});
}

/*
 * Gets information about a section and passes it into a callback.
 * @param id 		ID of the section
 * @param callback	Callback function that takes an object containing all information about the section as input.
 */
var getSection = function(id, callback) {
	db.get("SELECT * FROM Sections WHERE id = ?", id, function(err, row) {
		if(err) throw err;
		callback(row);
	});
}

/*
 * Gets information about a section and passes it into a callback.
 * @param name		Name of the section
 * @param callback	Callback function that takes an object containing all information about the section as input.
 */
var getSectionN = function(name, callback) {
	db.get("SELECT * FROM Sections WHERE name = ?", name, function(err, row) {
		if(err) throw err;
		callback(row);
	});
}

/*
 * Gets all posts from a section and passes an array of them into the callback. Posts will be sorted by descending date (ie, newest first).
 * @param id 			The ID of the section to grab posts from.
 * @param callback		The callback function called with a single argument; the array of all posts in the specified section.
 */
var getSectionPosts = function(id, callback) {
	db.all("SELECT * FROM Posts WHERE secID = ? ORDER BY postTime DESC", id, function(err, rows) {
		if(err) throw err;
		callback(rows);
	});
}

/*
 * Gets some number of the most recent posts from a section.
 * @param section		Name of the section we are looking at ("all" looks at all sections)
 * @param numPosts		Number of posts to grab.
 * @param callback		Function that takes the array of recent posts as input.
 */
var getRecentPosts = function(section, numPosts, callback) {
	if(section == "all") {
		db.all("SELECT * FROM Posts ORDER BY id DESC LIMIT ?", numPosts, function(err, rows) {
			if(err) throw err;
			callback(rows);
		});
	} else {
		db.all("SELECT * FROM Posts WHERE secID = ? ORDER BY id DESC LIMIT ?", section, numPosts, function(err, rows) {
			if(err) throw err;
			if (!rows) return;
			
			callback(rows);
		});
	}
}
 
/*
 * Inserts a new comment into the database.
 * @param post			The ID of the post this comment is attached to.
 * @param parent		The ID of the parent comment for this post. 0 if there is no parent.
 * @param content		The contents of the comment.
 * @param author		The ID of the user who made the comment.
 */
var newComment = function(post, parent, content, author) {
	db.run("INSERT INTO Comments (post, parent, content, author, postTime, votes) VALUES ($post, $parent, $content, $author, CURRENT_TIMESTAMP, 0)",
		   { $post: post, $parent: parent, $content: content, $author: author });
};

/*
 * Gets all the comments from a post and passes them into a callback.
 * @param post			The ID of the parent post
 * @param callback		Callback that takes an array of comments as input.
 */
var getComments = function(post, callback) {
	db.all("SELECT * FROM Comments WHERE post = ?", post, function(err, rows) {
		if(err) throw err;
		callback(rows);
	});
}

/*
 * Gets all the child comments of some comment and passes them into a callback.
 * @param parent		The ID of the parent comment
 * @param callback		Callback that takes an array of comments as input.
 */
var getChildComments = function(parent, callback) {
	db.all("SELECT * FROM Comments WHERE parent = ?", parent, function(err, rows) {
		if(err) throw err;
		callback(rows);
	});
}

exports.newPost = newPost;
exports.getPost = getPost;
exports.newUser = newUser;
exports.doesUserExist = doesUserExist;
exports.delUser = delUser;
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.verifyUser = verifyUser;
exports.newSection = newSection;
exports.doesSectionExist = doesSectionExist;
exports.getSection = getSection;
exports.getSectionN = getSectionN;
exports.getAllSections = getAllSections;
exports.delSection = delSection;
exports.getSectionPosts = getSectionPosts;
exports.getRecentPosts = getRecentPosts;
exports.getChildComments = getChildComments;
exports.newComment = newComment;
exports.getComments = getComments;
