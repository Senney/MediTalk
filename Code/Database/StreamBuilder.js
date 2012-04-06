var db = require('./DatabaseWrapper.js')

/**
	Gets a section's posts given the id.
	@param section the section id
	@param cb a callback function that takes an array containing the post rows from the database 
			with additional .url and .section properties, or undefined if there was an error
*/
function getSectionContent(sectionID, cb)
{
		getSectionCont(sectionID, 'getSection', cb)
}

/**
	Gets a section's posts given the name.
	@param section the section name
	@param cb a callback function that takes an array containing the post rows from the database 
			with additional .url and .section properties, or undefined if there was an error
*/
function getSectionContentN(section, cb)
{
		getSectionCont(section, 'getSectionN', cb)
}

/**
	Gets a section's posts given the section's database row(use if row was already loaded from database.)
	@param secRow the section's row
	@param cb a callback function that takes an array containing the post rows from the database 
			with additional .url and .section properties, or undefined if there was an error
*/
function getSectionContentR(secRow, cb)
{
		if(secRow.id && secRow.name)
			processPosts(secRow.id, secRow.name, cb)
		else
			cb()
}


function getSectionCont(sectionarg, dbfunc, cb)
{
	db[dbfunc](sectionarg, function(row)
		{
		if (row)
			processPosts(row.id, row.name, cb)
		else
			cb()		
		})
}

function processPosts(secid, secname, cb)
{
	db.getSectionPosts(secid, function(posts)
			{
			for(post in posts)
			{
				posts[post].url = "/streams/" + secname + "/" + posts[post].id
				posts[post].section = secname
			}
			cb(posts)
			})				
}

exports.getSectionContent = getSectionContent
exports.getSectionContentN = getSectionContentN
exports.getSectionContentR = getSectionContentR