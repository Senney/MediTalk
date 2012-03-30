/*
 * @fileOverview Runs tests for DatabaseWrapper.js. Mostly just makes sure things read and write properly, for now. Recommend deleting database before running tests.
 * @author Brent Glowinski
 */

dbw = require('./DatabaseWrapper.js');

var postTest = function() {
	var post1 = {title: "post1", author: 1, type: 0, content: "1", secid: 1};
	var post2 = {title: "post2", author: 1, type: 0, content: "2", secid: 0};
	var post3 = {title: "post3", author: 1, type: 0, content: "3", secid: 1};

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
	
	dbw.newUser(user1.username, user1.password, user1.email, user1.firstName, user1.lastName);
	dbw.checkUser(user1.username, user1.password, function(p1, p2) {
		if(p1 == p2) console.log("checkUser: SUCCESS");
		else console.log("checkUser: FAILURE");
	});
	
	dbw.getUser("user1", function(row) {
		if(row.username == user1.username && row.email == user1.email && row.firstName == user1.firstName && row.lastName == user1.lastName) console.log("getUser: SUCCESS");
		else console.log("getUser: FAILURE");
	});
	dbw.delUser(1);
	dbw.getUser(1, function(row) {
		if(row === undefined) console.log("delUser: SUCCESS");
		else console.log("delUser: FAILURE");
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
	var titles = 'Posts in sec1:';
	dbw.getSectionPosts(1, function(rows) {
		for(r in rows) {
			titles = titles + ' ' + rows[r].title;
		}
		console.log(titles);
	});
}

this.runTests = function() {
	postTest();
	userTest();
	secTest();
}

this.runTests();