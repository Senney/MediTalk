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
	if(userSessionTable[sessId] == undefined || userSessionTable[sessId].auth == 'false'){				
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
 * @param request	The incoming http request.
 * @returns The session of the user.
 */
function getSession(request) {
	return userSessionTable[request.cookies['connect.sid']];
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
	@param request an http request object
	@param response the associated response object
	@param next the next Connect middleware
*/

function logRequest(request, response, next)
{
	util.logger(util.LOG_TO_CONSOLE, new Date() + " " + request.method + " request received " + request.url);
	next()
}

/**
	Sends the front page of the site in the response body.
	@param request an http request object
	@param response the associated response object
*/

function mainPage(request, response)
{
	var section = "Memos";
	var session = getSession(request);

	//response.send('main')	//stub
	sb.createStream(db, 'MediTalk', 'all', 20, session, function(data) {
		response.render('index.jade', {
			locals: data,
		});
	});
}

/**
	Sends the stream category page in the response body.
	@param request an http request object
	@param response the associated response object
*/
function categoryList(request, response)
{
	response.send('categories')	//stub
}

/**
	Sends the category page in the response body for the category specified by the request object.
	@param request an http request object with a .params.catid field
	@param response the associated response object
*/

function viewCategory(request, response)
{
	var streamID = request.params.catid;
	sb.createStream(db, streamID, streamID, 20, getSession(request), function(data) {
		response.render('viewcategory.jade', { 
			locals: data,
		});
	});
}

/**
	Sends the view post page in the response body for the post specified by the request object.
	@param request an http request object with a .params.postid field
	@param response the associated response object
*/

function viewPost(request, response)
{
	var session = getSession(request);
	
	db.getAllSections(function(rows) {
		db.getPost(request.params.postid, function(post) {
			if(!post)
				response.redirect('/404', 404);
			else
			{
			response.render("viewpost.jade", { 
				locals: {
					pageTitle: 'Viewing Post',
					session: getSession(request),
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
	@param request an http request object
	@param response the associated response object
*/
	
function loginPage(request, response)
{
	//Check if user is already logged in
	var sessId = request.cookies['connect.sid'];
	if(userSessionTable[sessId] != undefined && userSessionTable[sessId].auth == 'true'){
		res.redirect('/');
	}
	else{
		response.render('login.jade');
	}	
	
}	

function viewSettings(request, response)
{
	response.send('settings') //stub
}

function changeSettings(request, response)
{
	response.send('changing settings') //stub
}

/**
 * Renders the view for the new post page.
 * @param request	Incoming request.
 * @param response	Outgoing response.
 */ 
function newPost(request, response) {
	var stream = request.params.catid;
	
	// Ensure that the section exists before we render the new post.
	db.doesSectionExist(stream, function(exist) {
		if (exist) {
			sb.getPageData(db, 'New Post', getSession(request), function(data) {
				data.stream = stream;
				response.render('newpost.jade', {
					locals: data,
				});
			});
		} else {
			response.redirect('/', 301);
		}
	});
}

function makePost(request, response)
{
	var stream = request.params.catid;
	var session = getSession(request);
	
	db.doesSectionExist(stream, function(exist) {
		if (exist) {
			var title = request.body.post.title;
			var content = request.body.post.content;
			
			// replace newlines with html break tags.
			
			content.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
			console.log(content);
			
			if (content != '' && title != '')	
				db.newPost(0, title, content, session.uname, stream);
						
			response.redirect('/streams/' + stream, 301);
		} else {
			response.redirect('/', 301);
		}
	});
}

function makeComment(request, response)
{
	viewPost(request,response)		//stub
}

function adminPage(request, response)
{
	// Find our user session
	var session = getSession(request);
	
	// Ensure that said user has permission to be here.
	if (getSession(request).type != ADMIN_FLAG) {
		response.redirect('/', 301);
		return;
	}
	
	// Set up the page for rendering.
	sb.getPageData(db, 'Administration', session, function(data) {
		db.getAllUsers(function(users) {
			data.users = users;
			response.render("admin.jade", { 
				locals: data,
			});
		});
	});
}

function adminAction(request, response)
{
	if (getSession(request).type != ADMIN_FLAG) {
		response.redirect('/404', 404);
		return;
	}

	var type = request.body.type;
	if (type == ADMIN_ADD_USER) {
		var username = request.body.user.name;
		var password = request.body.user.password;
		var email = request.body.user.email;
		var firstName = request.body.user.first;
		var lastName = request.body.user.last;
		var flags = request.body.user.flags;
		console.log("Running query.");
		db.newUser(username, password, email, firstName, lastName, flags);
	} else if (type == ADMIN_ADD_SECTION) {
		console.log(request.body); 
		var secName = request.body.sec.title;
		var secDesc = request.body.sec.desc;
		db.newSection(0, secName, secDesc);
	}

	response.redirect("/admin", 301);
}

function login(request, response)
{	
	// Check if the user is already authenticated.
	if (getSession(request) != undefined) {
		response.redirect('/', 301);
		return;
	}
	
	// Grab the username and password from the post request.
	var userName = request.body.user.name;
	var userPass = request.body.user.password;
	
	// Ensure that we have valid data.
	if (userName == "" || userPass == "") {
		response.redirect('/login');
		return;
	}
	
	// Check the user in the database.
	db.verifyUser(userName, userPass, function(passValid, id, flags) {
		//if valid password, update userSessionTable to show user as authenticated
		if(passValid && id != undefined){
			//Store session Id in table for current user
			var session = new userSession(id, request.cookies['connect.sid'], true, userName, flags);
			userSessionTable[session.sessionId] = session;
			util.logger(util.LOG_TO_CONSOLE, 'User: ' + userName + ' logged in at: ' + new Date());
				
			//Redirect user to home page.
			response.redirect('/');
		} else {
			response.redirect('/login', 301);
		}
	});	
}

/**
 * Removes the current user from the session table, thereby logging them out.
 * @param request Http request object
 * @param response Http response object
 */
function logout(request, response){
	//Remove session Id from table
	var session = request.cookies['connect.sid'];
	if(userSessionTable[session] != undefined){
		util.logger(util.LOG_TO_CONSOLE, 'User: ' + userSessionTable[session].userId + ' logged out at: ' + new Date());
		delete userSessionTable[session];
	}
	else{
		//Not sure if this should be a error since anyone can navigate to the /logout url even if they're not
		//logged in.  Could change that though.  		
	}
	
	response.redirect('/login', 301);
}

/**
	Sends the appropriate http response given an error thrown by a server function.
	@param error the error thrown
	@param request the http request object that was being served
	@param response the associated response object
*/
function errorHandler(error, request, response)
{
	if(error.message == URL_NOT_FOUND)
		response.send('404 page', 404);	//stub
	//if else other error types
	else
		throw error;
}

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
server.error(errorHandler);

//routing information that express uses in server.router, basically a bunch of regexp matching
//with any :x captured and added to the request object as request.params.x

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

//server.all('*', function() { throw new Error(URL_NOT_FOUND) } ); //catch-all for urls that fall through all the other matches

server.listen(serverPort);	
