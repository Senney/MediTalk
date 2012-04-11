//these tests won't be thorough if any posts exist in a section named fJKLjklerw34$kjl

var sb = require("./StreamBuilder.js");
var util = require("../Util/util");
var db = require("../Database/DatabaseWrapper.js")

function sBuilderPageDataEquals(a, b)
{
	var sectionsEqual = true
	if(a.sections.length != b.sections.length)
		sectionsEqual = false
	else
		for(index in a.sections)
			if(a.sections[index].name != b.sections[index].name)
				sectionsEqual = false	
	return (a.pageTitle == b.pageTitle && a.session == b.session && sectionsEqual)
}

function sBuilderStreamObjEquals(a,b)
{
	var postsEqual = true
	if(a.posts.length != b.posts.length)
		postsEqual = false
	else
		for(index in a.posts)
			if(!postEquals(a.posts[index], b.posts[index]))
				postsEqual = false
	return (sBuilderPageDataEquals(a,b) && a.isFrontPage == b.isFrontPage && a.stream == b.stream && postsEqual)
}

function postEquals(a,b)
{
	return (a.title == b.title && a.type == b.type && a.author == b.author && a.content == b.content && a.secID == b.secID)
}


var runTests = function(test) {
	util.logger(util.LOG_TO_CONSOLE, "Running StreamBuilder tests.");
	
	db.getAllSections(function (secs)
	{
		test(function(cb) { sb.getPageData(db, '1', 1, cb) },
			{pageTitle: '1', session: 1, sections: secs},
			sBuilderPageDataEquals, "getPageDataSimple");
	})
	
	db.getAllSections(function (secs)
	{
		db.getRecentPosts("Memos", 1, function(memosposts)
		{
			test(function(cb) { sb.createStream(db, '1', "Memos", 1, 1, cb) }, 
				{pageTitle: '1', session: 1, sections: secs, isFrontPage: false, stream: "Memos", posts: memosposts},
				sBuilderStreamObjEquals, "createStreamASection")
		})
	})

	db.getAllSections(function (secs)
	{
		db.getRecentPosts("fJKLjklerw34$kjl", 1, function(posts)
		{
			test(function(cb) { sb.createStream(db, '1', "fJKLjklerw34$kjl", 1, 1, cb) }, 
				{pageTitle: '1', session: 1, sections: secs, isFrontPage: false, stream: "fJKLjklerw34$kjl", posts: posts},
				sBuilderStreamObjEquals, "createStreamEmptySection")
		})
	})
}

exports.runTests = runTests;
