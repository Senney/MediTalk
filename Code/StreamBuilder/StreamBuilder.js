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
	
	getPageData(db, pageTitle, userSession, function(retObj) {
		if (streamName == 'all')
			retObj.isFrontPage = true;
		else
			retObj.isFrontPage = false;
		
		db.getRecentPosts(streamName, numPosts, function(posts) {
			retObj.stream = streamName;
			retObj.posts = parsePosts(posts);
			callback(retObj);
		});
	});
}

/**
 * Acquires general data for pages from the database.
 * @param db		The database which we're connecting to.
 * @param pageTitle	The title for the page.
 * @param userSession 	The session of the user viewing the page.
 * @param callback	The callback into which we'll pass the data. Format: callback(data)
 */
var getPageData = function(db, pageTitle, userSession, callback) {
	var retObj = {};
	db.getAllSections(function(secs) {
		retObj.pageTitle = pageTitle;
		retObj.session = userSession;
		retObj.sections = secs;
		callback(retObj);
	});
}

/**
 * Parses a list of posts, creating a URL for each one.
 * @param posts		The array of posts from the database.
 * @returns posts 	{Object} An array of posts.
 */
var parsePosts = function(posts) {
	for (var i in posts) {
		posts[i].url = '/streams/' + posts[i].secID + '/' + posts[i].id;
	}
	
	return posts;
}

// Export the required functions.
exports.createStream = createStream;
exports.getPageData = getPageData;
