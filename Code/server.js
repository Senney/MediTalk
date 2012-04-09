/**
 *  Main module for handling server operations
 */

const DEFAULT_PORT = 10032;
const SESSION_EXPIRE_TIME = 3600000;   //How long sessions are kept in the table after last use (1 hour)
const CLEAN_SESSION_INTERVAL = 3600000; //How often the server checks for expired sessions
 
 
var serverPort = process.argv[2]
if(!serverPort)
	serverPort = DEFAULT_PORT
	
var util = require('./Util/util');
var db = require('./Database/DatabaseWrapper.js');
var sb = require('./StreamBuilder/StreamBuilder.js');
var express = require('express');

var server = express.createServer();

//The path to the root of the server file system
const ROOT_DIRECTORY = ".";

//Constants for different error types mapped to http status codes
const SERVER_REDIRECT = 301;
const ACTION_NOT_FOUND = 404;
const URL_NOT_FOUND = 404;
const INVALID_FILE_EXTENSION = 415;
const FILE_EXISTS = 409;
const FILE_IO_ERROR = 500;
const READ_ERROR = 408;

// admin function constants.
const ADMIN_FLAG = 1;
const ADMIN_ADD_USER = 0;
const ADMIN_ADD_SECTION = 1;
const ADMIN_DEL_USER = 2;

/**********************************************
 * 	User Security Objects and Functions
 **********************************************/
//Session object to track if a user is logged in or not
function userSession(userId, sessionId, auth, uname, flag){
	this.userId = userId;
	this.sessionId = sessionId;
	this.auth = auth;
	this.uname = uname;
	this.type = flag;
	this.lastSeen = new Date();
	return this;
}

//Table of session objects
var userSessionTable = {};

//Default functions that will be called for all requests
var common = [authUser];

/**
 * authUser(req,res, next)
 * Checks the userSessionTable for the session Id from the request to check if that
 * session Id has been authenticated
 * @param req  Http request
 * @param res  Response object
 * @param next Tells the server to move on to the next function for the request
 */
function authUser(req, res, next){
	
	//Get session ID
	var sessId = req.cookies['connect.sid'];	
	
	//Check that session ID has been authenticated 
	if(userSessionTable[sessId] == undefined || userSessionTable[sessId].auth == false){				
		//Redirect to login page
		res.redirect('/login');		
	}
	else{
		//Update session lastSeen with now and continue with normal routing
		userSessionTable[sessId].lastSeen = new Date();
		next();
	}	
}

/**
 * Returns the session of the users request.
 * @param req	The incoming http request.
 * @returns The session of the user.
 */
function getSession(req) {
	return userSessionTable[req.cookies['connect.sid']];
}

 /*
 * Runs every hour to remove old sessions from the user session table
 */
setInterval(cleanSessionTable, CLEAN_SESSION_INTERVAL);

/**
 * Removes sessions from the session table that are older than the set maximum.  
 * This function should be called by a timer process in Node, registered with setInterval()
 */
function cleanSessionTable(){
	var now = new Date();
	for(session in userSessionTable){
		var lastSeen = userSessionTable[session].lastSeen;
		var timeDiff = now - lastSeen;
		if(timeDiff > SESSION_EXPIRE_TIME){
			delete userSessionTable[session]; 
		}
	}
}

/**
	Logs request information to console.
	@param req an http request object
	@param res the associated response object
	@param next the next Connect middleware
*/

function logRequest(req, res, next)
{
	util.logger(util.LOG_TO_CONSOLE, new Date() + " " + req.method + " request received " + req.url);
	next()
}

/**
	Sends the front page of the site in the response body.
	@param req an http request object
	@param res the associated response object
*/

function mainPage(req, res)
{
	var section = "Memos";
	var session = getSession(req);

	sb.createStream(db, 'MediTalk', 'all', 20, session, function(data) {
		res.render('index.jade', {
			locals: data,
		});
	});
}

/**
	Sends the stream category page in the response body.
	@param req an http request object
	@param res the associated response object
*/
function categoryList(req, res)
{
	res.send('categories')	//stub
}

/**
	Sends the category page in the response body for the category specified by the request object.
	@param req an http request object with a .params.catid field
	@param res the associated response object
*/

function viewCategory(req, res)
{
	var streamID = req.params.catid;
	sb.createStream(db, streamID, streamID, 20, getSession(req), function(data) {
		res.render('viewcategory.jade', { 
			locals: data,
		});
	});
}

/**
	Sends the view post page in the response body for the post specified by the request object.
	@param req an http request object with a .params.postid field
	@param res the associated response object
*/

function viewPost(req, res)
{
	var session = getSession(req);
	
	db.getAllSections(function(rows) {
		db.getPost(req.params.postid, function(post) {
			if(!post)
				res.redirect('/', 404);
			else
			{
			res.render("viewpost.jade", { 
				locals: {
					pageTitle: 'Viewing Post',
					session: getSession(req),
					sections: rows,
					post: post
					}
				})
			}
		});
	});
}

/**
	Sends the login page in the response body.
	@param req an http request object
	@param res the associated response object
*/
	
function loginPage(req, res)
{
	//Check if user is already logged in
	var sessId = req.cookies['connect.sid'];
	if(userSessionTable[sessId] != undefined && userSessionTable[sessId].auth == true){
		res.redirect('/');
	}
	else{
		res.render('login.jade');
	}	
	
}	

/**
 * Renders the view for the new post page.
 * @param req	Incoming request.
 * @param res	Outgoing response.
 */ 
function newPost(req, res) {
	var stream = req.params.catid;
	
	// Ensure that the section exists before we render the new post.
	db.doesSectionExist(stream, function(exist) {
		if (exist) {
			sb.getPageData(db, 'New Post', getSession(req), function(data) {
				data.stream = stream;
				res.render('newpost.jade', {
					locals: data,
				});
			});
		} else {
			res.redirect('/', SERVER_REDIRECT);
		}
	});
}

/**
 * Creates a new post using user input from the request object.
 * @param req	Incoming request.
 * @param res	Outgoing response.
 */ 
function makePost(req, res)
{
	var stream = req.params.catid;
	var session = getSession(req);
	
	db.doesSectionExist(stream, function(exist) {
		if (exist) {
			var title = req.body.post.title;
			var content = req.body.post.content;
			
			// replace newlines with html break tags.
			
			content.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
			console.log(content);
			
			if (content != '' && title != '')	
				db.newPost(0, title, content, session.uname, stream);
						
			res.redirect('/streams/' + stream, SERVER_REDIRECT);
		} else {
			res.redirect('/', SERVER_REDIRECT);
		}
	});
}

/**
 * Renders the admin page.
 * @param req	Incoming request.
 * @param res	Outgoing response.
 */ 
function adminPage(req, res)
{
	// Find our user session
	var session = getSession(req);
	
	// Ensure that said user has permission to be here.
	if (getSession(req).type != ADMIN_FLAG) {
		res.redirect('/', SERVER_REDIRECT);
		return;
	}
	
	// Set up the page for rendering.
	sb.getPageData(db, 'Administration', session, function(data) {
		db.getAllUsers(function(users) {
			data.users = users;
			res.render("admin.jade", { 
				locals: data,
			});
		});
	});
}

/**
 * Takes various administrator actions based on the request body.
 * @param req	Incoming request.
 * @param res	Outgoing response.
 */ 
function adminAction(req, res)
{
	// Ensure that our current user is properly authenticated as an administrator.
	if (getSession(req).type != ADMIN_FLAG) {
		res.redirect('/', 404);
		return;
	}

	// Find the type of request.
	var type = req.body.type;
	if (type == ADMIN_ADD_USER) {
		// Get the data from our UI.
		var username = req.body.user.name;
		var password = req.body.user.password;
		var email = req.body.user.email;
		var firstName = req.body.user.first;
		var lastName = req.body.user.last;
		var flags = req.body.user.flags;
		
		// Submit to database.
		db.newUser(username, password, email, firstName, lastName, flags);
	} else if (type == ADMIN_ADD_SECTION) {
		// Get the data from our UI.
		var secName = req.body.sec.title;
		var secDesc = req.body.sec.desc;
		
		// Insert to database.
		db.newSection(0, secName, secDesc);
	}

	res.redirect("/admin", SERVER_REDIRECT);
}

/**
 * Logs in a user and creates a user session based on input from the request body.
 * @param req	Incoming request.
 * @param res	Outgoing response.
 */ 
function login(req, res)
{	
	// Check if the user is already authenticated.
	if (getSession(req) != undefined) {
		res.redirect('/', SERVER_REDIRECT);
		return;
	}
	
	// Grab the username and password from the post request.
	var userName = req.body.user.name;
	var userPass = req.body.user.password;
	
	// Ensure that we have valid data.
	if (userName == "" || userPass == "") {
		res.redirect('/login');
		return;
	}
	
	// Check the user in the database.
	db.verifyUser(userName, userPass, function(passValid, id, flags) {
		//if valid password, update userSessionTable to show user as authenticated
		if(passValid && id != undefined){
			//Store session Id in table for current user
			var session = new userSession(id, req.cookies['connect.sid'], true, userName, flags);
			userSessionTable[session.sessionId] = session;
			util.logger(util.LOG_TO_CONSOLE, 'User: ' + userName + ' logged in at: ' + new Date());
				
			//Redirect user to home page.
			res.redirect('/');
		} else {
			res.redirect('/login', SERVER_REDIRECT);
		}
	});	
}

/**
 * Removes the current user from the session table, thereby logging them out.
 * @param req Http request object
 * @param res Http response object
 */
function logout(req, res){
	//Remove session Id from table
	var session = req.cookies['connect.sid'];
	if(userSessionTable[session] != undefined){
		util.logger(util.LOG_TO_CONSOLE, 'User: ' + userSessionTable[session].userId + ' logged out at: ' + new Date());
		delete userSessionTable[session];
	}
	
	res.redirect('/login', SERVER_REDIRECT);
}

//********not implemented***********

function makeComment(req, res)
{
	viewPost(req,res)		//stub
}

function viewSettings(req, res)
{
	res.send('settings') //stub
}

function changeSettings(req, res)
{
	res.send('changing settings') //stub
}

//**********************************
//the Connect middleware used by the server, basically a series of functions that get called with the request and response objects
//and a next() function that goes to the next one

server.use(logRequest);
server.use(express.bodyParser());
server.use(express.cookieParser());
server.use(express.session({secret: 'this string is used for signed cookies or something'}));
server.use(express.static(__dirname + "/Static"));
server.set('views', __dirname + "/Static");
server.set('view options', { layout: false });
server.use(server.router);

//routing information that express uses in server.router, basically a bunch of regexp matching
//with any :x captured and added to the request object as req.params.x

server.get('/streams/:catid/:postid', common, viewPost);
server.get('/streams/:catid', common, viewCategory);
server.get('/streams/', common, categoryList);
server.get('/', common, mainPage);

server.get('/user', common, viewSettings);
server.post('/user', common, changeSettings);

server.get('/new/:catid', common, newPost);
server.post('/new/:catid', common, makePost);

server.get('/admin', common, adminPage);
server.post('/admin', common, adminAction);

server.get('/login', loginPage);
server.post('/login', login);
server.get('/logout', logout);

server.all('*', function(req, res) { res.redirect('/', 404) } ); //catch-all for urls that fall through all the other matches

server.listen(serverPort);	
