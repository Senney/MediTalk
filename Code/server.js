/**
 *  Main module for handling server operations
 */

const DEFAULT_PORT = 10032
 
var serverPort = process.argv[2]
if(!serverPort)
	serverPort = DEFAULT_PORT
	
var util = require('./Util/util');
var db = require('./Database/DatabaseWrapper.js');
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

/**********************************************
 * 	User Security Objects and Functions
 **********************************************/
//Session object to track if a user is logged in or not
function userSession(userId, sessionId, auth, uname){
	this.userId = userId;
	this.sessionId = sessionId;
	this.auth = auth;
	this.uname = uname;
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
		//Continue with normal routing
		next();
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
	var id = 1;
	var session = userSession(1, 1, 1, "Senney");
	console.log(session);

	//response.send('main')	//stub
	db.getAllSections(function(rows) {
		response.render('index.jade', {
			locals: {
				pageTitle: 'MediTalk',
				posts: [{title: 'Memo!', url: '/streams/' + section + '/' + id, section: section, author: 'Sean'}],
				session: session,
				sections: rows,
				}	
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
	//stub
	response.send("category: " +  request.params.catid)
}

/**
	Sends the view post page in the response body for the post specified by the request object.
	@param request an http request object with a .params.postid field
	@param response the associated response object
*/

function viewPost(request, response)
{
	var session = userSession(1, 1, 1, "Senney");
	
	db.getAllSections(function(rows) {
		response.render("viewpost.jade", { 
			locals: {
				pageTitle: 'Viewing Post',
				session: session,
				sections: rows,
				post: {title: "Test Post", author: "Test Author", time: new Date().toDateString(),
					content: "This is some test content."},
				}
	
		});
	});
}

function viewNewPost(request, response) {
		
}

/**
	Sends the login page in the response body.
	@param request an http request object
	@param response the associated response object
*/
	
function loginPage(request, response)
{
	response.render('login.jade');
}	

// ********The server functions from this point on are all login/session based and I haven't looked into how that works yet - Chris
	
function viewSettings(request, response)
{
	response.send('settings') //stub
}

function changeSettings(request, response)
{
	response.send('changing settings') //stub
}

function makePost(request, response)
{
	viewCategory(request, response)		//stub
}

function makeComment(request, response)
{
	viewPost(request,response)		//stub
}

function adminPage(request, response)
{
	var session = userSession(1, 1, 1, "Senney");
	
	db.getAllSections(function(rows) {
		response.render("admin.jade", { 
			locals: {
				pageTitle: 'Administration',
				session: session,
				sections: rows,
				}
	
		});
	});
}

function adminAction(request, response)
{
	response.send('doing admin stuff') //stub
}

function login(request, response)
{	
	//Get user pass from request somehow
	//TODO This needs to be built in from the content builder
	var userName = request.body.user.name;
	var userPass = request.body.user.pass;	
	
	if (userName == "" || userPass == "") {
		response.redirect('/login');
		return;
	}
	
	//Check if pass is valid
	//TODO compare the pass from the request body with the one in the database
//	var passValid = checkPass() or something
	var passValid = true;
	var userId = 1;
	
	//if valid password, update userSessionTable to show user as authenticated
	if(passValid){
		//Store session Id in table for current user
		var session = new userSession(userId, request.cookies['connect.sid'], true);
		userSessionTable[session.sessionId] = session;
		util.logger(util.LOG_TO_CONSOLE, 'User: ' + userName + ' logged in at: ' + new Date());
				
		//Redirect user to home page.
		response.redirect('/');
	}
	else{
		//Display message to user
		next(new Error('Invalid Username/Password'));
	}	
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

server.post('/streams/:catid/:postid', common, makeComment);
server.post('/streams/:catid', common, makePost);

server.get('/admin', common, adminPage);
server.post('/admin', common, adminAction);

server.get('/login', loginPage);
server.post('/login', login);

server.all('*', function() { throw new Error(URL_NOT_FOUND) } ); //catch-all for urls that fall through all the other matches

server.listen(serverPort);	