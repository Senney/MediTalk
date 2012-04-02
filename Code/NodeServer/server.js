/**
 *  Main module for handling server operations
 */

const DEFAULT_PORT = 10032
 
var serverPort = process.argv[2]
if(!serverPort)
	serverPort = DEFAULT_PORT
	
var util = require('../Util/util.js');
var express = require('express')

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
	response.send('main')	//stub
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
	if(request.params.catid > 0)
		response.send("category: " +  request.params.catid)
	else
		throw new Error(URL_NOT_FOUND)
}

/**
	Sends the view post page in the response body for the post specified by the request object.
	@param request an http request object with a .params.postid field
	@param response the associated response object
*/

function viewPost(request, response)
{
	//stub
	if(request.params.postid > 0)
		response.send("category: " +  request.params.catid + " post: " + request.params.postid)
	else
		throw new Error(URL_NOT_FOUND)	
}

/**
	Sends the login page in the response body.
	@param request an http request object
	@param response the associated response object
*/
	
function loginPage(request, response)
{
	response.send('login')	//stub
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
	response.send('admin')	//stub
}

function adminAction(request, response)
{
	response.send('doing admin stuff') //stub
}

function login(request, response)
{
	response.send('doing login stuff') //stub
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
		response.send('404 page', 404)	//stub
	//if else other error types
	else
		throw error	
}

//the Connect middleware used by the server, basically a series of functions that get called with the request and response objects
//and a next() function that goes to the next one

server.use(logRequest)
server.use(express.bodyParser())
server.use(express.cookieParser())
server.use(express.session({secret: 'this string is used for signed cookies or something'}))
server.use(server.router)
server.error(errorHandler)

//routing information that express uses in server.router, basically a bunch of regexp matching
//with any :x captured and added to the request object as request.params.x

server.get('/streams/:catid/:postid', viewPost)
server.get('/streams/:catid', viewCategory)
server.get('/streams/', categoryList)
server.get('/', mainPage)

server.get('/user', viewSettings)
server.post('/user', changeSettings)

server.post('/streams/:catid/:postid', makeComment)
server.post('/streams/:catid', makePost)

server.get('/admin', adminPage)
server.post('/admin', adminAction)

server.get('/login', loginPage)
server.post('/login', login)

server.all('*', function() { throw new Error(URL_NOT_FOUND) } ) //catch-all for urls that fall through all the other matches

server.listen(serverPort);	