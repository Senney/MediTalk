/*
 * @fileOverview Provides a wrapper for all required interactions with the database, as well as initializing the database on startup. Utilizes the package node-sqlite3.
 * @author Brent Glowinski
 */

var sqlite = require("./node_modules/sqlite3/sqlite3");
var db = new sqlite.Database("MediTalk.db");
db.serialize();
// id | username | password | email | lastSession | firstName | lastName
db.run("CREATE TABLE IF NOT EXISTS Users ( id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT, lastSession datetime, firstName TEXT, lastName TEXT)");
// id | parent | secID | name | description | postCount | watchers
db.run("CREATE TABLE IF NOT EXISTS Sections ( id int PRIMARY KEY, parent int, name TEXT, description TEXT, postCount int, watchers TEXT)");
// id | type | title | content | author | secid | postTime | votes | comments | watchers
db.run("CREATE TABLE IF NOT EXISTS Posts ( id INTEGER PRIMARY KEY, type INTEGER, title TEXT, content varchar(1000), author INTEGER, secID INTEGER, postTime datetime, votes INTEGER, comments INTEGER, watchers TEXT)");
// id | post | parent | content | author | postTime | votes
db.run("CREATE TABLE IF NOT EXISTS Comments ( id int PRIMARY KEY, post int, parent int, content TEXT, author int, postTime datetime, votes int)");
// id | location | size | uploadTime | uploader
db.run("CREATE TABLE IF NOT EXISTS Documents ( id int PRIMARY KEY, location TEXT, size int, uploadTime datetime, uploader int)");
//db.parallelize();

/*
 * Inserts a new post in to the database based on the parameters passed in.
 * @param type		Type of post; 0 for text, 1 for link, 2 for document.
 * @param title		Title of the post
 * @param content	Contents of the post. Can be text, a URL, or the location of a document on the server
 * @param author	The author of the post
 * @param secid		The section the post is associated with
 */
var newPost = function (type, title, content, author, secid) {
	db.run("INSERT INTO Posts (type, title, content, author, secID, postTime, votes, comments, watchers) VALUES ($type, $title, $content, $author, $secid, CURRENT_TIMESTAMP, 0, 0, '')", 
		   { $type: type, $title: title, $content: content, $author: author, $secid: secid });
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
var newUser = function(username, password, email, firstName, lastName) {
	db.run("INSERT INTO Users (username, password, email, firstName, lastName) VALUES ($user, $pass, $email, $first, $last)", 
		   { $user: username, $pass: password, $email: email, $first: firstName, $last: lastName });
}

var delUser = function(id) {
	db.run("DELETE FROM Users WHERE id = ?", id);
}

/*
 * Gets the user's password out of the database, then passes the user's password as well as a provided password to a callback.
 * @param username		The username that the function is checking the password for
 * @param password		Password to be forwarded into the callback
 * @param callback		Function that handles the provided password and the one in the database. Takes two arguments: the provided password, and the password in the database.
 */
var checkUser = function(username, password, callback) {
	db.get("SELECT password FROM Users WHERE username = ?", username, function(err, row) {
		if(err) throw err;
		callback(password, row.password);
	});
}

/*
 * Gets the username of the user along with some miscellaneous information and passes it all in to a callback function.
 * @param id			ID of the user
 * @param callback		Callback that takes the object containing all the data as input. Contents: username, email, lastSession, firstName, lastName
 */
var getUser = function(id, callback) {
	db.get("SELECT username, email, lastSession, firstName, lastName FROM Users WHERE username = ?", id, function(err, row) {
		if(err) throw err;
		callback(row);
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
 * Deletes a section from the database corresponding to an integer ID.
 * @param id	ID of section to be deleted.
 */
var delSection = function(id) {
	db.run("DELETE FROM Sections WHERE id = ?", id);
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
	db.all("SELECT * FROM Comments WHERE id = ?", post, function(err, rows) {
		if(err) throw err;
		callback(rows);
	});
}

exports.newPost = newPost;
exports.getPost = getPost;
exports.newUser = newUser;
exports.delUser = delUser;
exports.getUser = getUser;
exports.checkUser = checkUser;
exports.newSection = newSection;
exports.getSection = getSection;
exports.delSection = delSection;
exports.getSectionPosts = getSectionPosts;
exports.newComment = newComment;
exports.getComments = getComments;