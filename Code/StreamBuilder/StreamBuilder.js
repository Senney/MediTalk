/**
 * @fileOverview Creates a stream based on a string of parameters.
 * @author Sean Heintz
 **/
 

 /**
  *	A function to create a forum stream from data in the database.
  * @param db			The database.
  * @param pageTitle	The title of the page that we're building.
  * @param numPosts		The number of posts to read in.
  * @param userSession	The session of the user accessing the stream.
  * @param callback		A callback function to be run after grabbing the data.
  */
var createStream = function(db, pageTitle, streamName, numPosts, userSession, callback) {
	if (db == undefined) {
		console.log("createStream requires a database to be defined.");
		return;
	}

	var retObj = {};
	retObj.pageTitle = pageTitle;
	retObj.session = userSession;
	db.getAllSections(function(secs) {
		db.getRecentPosts(streamName, numPosts, function(posts) {
			retObj.stream = streamName;
			retObj.posts = posts;
			retObj.sections = secs;
			callback(retObj);
		});
	});
}

exports.createStream = createStream;