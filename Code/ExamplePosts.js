var db = require('./Database/DatabaseWrapper.js');

//add example posts
db.getSectionN("Memos", function (row)
	{
	db.newPost(1, "Memo!", "this is a memo", "Sean", row.id)
	})