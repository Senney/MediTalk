/*
 * @fileOverview Runs tests for DatabaseWrapper.js. Mostly just makes sure things read and write properly, for now. Recommend deleting database before running tests.
 * @author Brent Glowinski
 */

dbw = require('./DatabaseWrapper.js');

var postTest = function() {
	var post1 = {title: "post1", author: 1, type: 0, content: "1", secid: 1};
	var post2 = {title: "post2", author: 1, type: 0, content: "2", secid: 0};
	var post3 = {title: "post3", author: 1, type: 0, content: "3", secid: 1};
	console.log("POSTS: " + post1.title + " " + post2.title + " " + post3.title);

	dbw.newPost(post1.type, post1.title, post1.content, post1.author, post1.secid);
	dbw.newPost(post2.type, post2.title, post2.content, post2.author, post2.secid);
	dbw.newPost(post3.type, post3.title, post3.content, post3.author, post3.secid);
	
	dbw.getPost(1, function(row) {
		if(row.title == post1.title && row.type == post1.type && row.author == post1.author && row.content == post1.content && row.secid == post1.secID) console.log("Post1: Success");
		else console.log("Post1: Failure");
	});
	dbw.getPost(2, function(row) {
		if(row.title == post2.title && row.type == post2.type && row.author == post2.author && row.content == post2.content && row.secid == post2.secID) console.log("Post2: Success");
		else console.log("Post2: Failure");
	});
	dbw.getPost(3, function(row) {
		if(row.title == post3.title && row.type == post3.type && row.author == post3.author && row.content == post3.content && row.secid == post3.secID) console.log("Post3: Success");
		else console.log("Post3: Failure");	});
}

var userTest = function() {
	var user1 = {username: "user1", password: "123", email: "hey@there.you", firstName: "T", lastName: "G"};
	var user2 = {username: "user1", password: "123", email: "hey@there.you", firstName: "T", lastName: "G"};
	
	dbw.newUser(user1.username, user1.password, user1.email, user1.firstName, user1.lastName);
	dbw.verifyUser(user1.username, user1.password, function(check) {
		if(check) console.log("checkUser: SUCCESS");
		else console.log("checkUser: FAILURE");
	});
	
	dbw.getUser("user1", function(row) {
		console.log(row.lastSession);
		if(row.username == user1.username && row.email == user1.email && row.firstName == user1.firstName && row.lastName == user1.lastName) console.log("getUser: SUCCESS");
		else console.log("getUser: FAILURE");
	});
	dbw.delUser(1);
	dbw.getUser(1, function(row) {
		if(row === undefined) console.log("delUser: SUCCESS");
		else console.log("delUser: FAILURE");
	});
	dbw.getUser(2, function(row) {
		if(row === undefined) console.log("Add same username: SUCCESS");
		else console.log("Add same username: FAILURE");
	});
}

var secTest = function() {
	var sec1 = { parent: 0, name: "sec1", description: "section" }
	dbw.newSection(sec1.parent, sec1.name, sec1.description);
	
	dbw.getSection(1, function(row) {
		if(row === undefined) console.log("getSection: FAILURE");
		else if(row.parent == sec1.parent && row.name == sec1.name && row.description == sec1.description) console.log("getSection: SUCCESS");
		else console.log("getSection: FAILURE");
	});
	dbw.getSectionN("sec1", function(row) {
		if(row === undefined) console.log("getSectionN: FAILURE");
		else if(row.parent == sec1.parent && row.description == sec1.description) console.log("getSectionN: SUCCESS");
		else console.log("getSectionN: FAILURE");
	});
	dbw.getSectionPosts(1, function(rows) {
		var titles = 'Posts in sec1:';
		for(r in rows) {
			titles = titles + ' ' + rows[r].title;
		}
		console.log(titles);
	});
	dbw.getRecentPosts("all", 2, function(rows) {
		var title = 'Recent posts:';
		for(r in rows) {
			title = title + ' ' + rows[r].title;
		}
		console.log(title);
	});
}

var commTest = function() {
	var com1 = { post: 1, parent: 0, content: "com1", author: "me" };
	var com2 = { post: 1, parent: 1, content: "com2", author: "me" };
	var com3 = { post: 1, parent: 0, content: "com3", author: "you" };
	var com4 = { post: 2, parent: 0, content: "com4", author: "you" };
	
	console.log("COMMENTS: " + com1.content + " " + com2.content + " " + com3.content + " " + com4.content);
	
	dbw.newComment(com1.post, com1.parent, com1.content, com1.author);
	dbw.newComment(com2.post, com2.parent, com2.content, com2.author);
	dbw.newComment(com3.post, com3.parent, com3.content, com3.author);
	dbw.newComment(com4.post, com4.parent, com4.content, com4.author);
	
	dbw.getComments(1, function(rows) {
		var s = "";
		for(r in rows) s = s + " " + rows[r].content;
		console.log("Comments in post1: " + s);
	});
	
	dbw.getChildComments(1, function(rows) {
		var s = "";
		for(r in rows) s = s + rows[r].content;
		console.log("Children of comment1: " + s);
	});
}

this.runTests = function() {
	postTest();
	userTest();
	secTest();
	commTest();
}

this.runTests();
