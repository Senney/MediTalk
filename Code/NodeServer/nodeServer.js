/**
 *  Main module for handling server operations
 */


var http = require('http');
var server = http.createServer();

var util = require('../Util/util.js');

//The path to the root of the server file system
const ROOT_DIRECTORY = ".";

//Constants for different error types mapped to http status codes
const ACTION_NOT_FOUND = 404;
const URL_NOT_FOUND = 404;
const INVALID_FILE_EXTENSION = 415;
const FILE_EXISTS = 409;
const FILE_IO_ERROR = 500;
const READ_ERROR = 408;

server.listen(10032);


/**
 * Sets the server to listen for 'request' events and passes a GET or POST request off
 * to the correct handler.
 */
server.on('request', function(request, response){
	if(request.method == 'GET'){
		util.logger(util.LOG_TO_CONSOLE, new Date() + " -- GET Request recieved: " + request.url);
		getHandler(request, response);
	}
	else if(request.method == 'POST'){
		util.logger(util.LOG_TO_CONSOLE, new Date() + " -- POST Request recieved: " + request.url);
		postHandler(request, response);	
	}
});	

/**
 * Handles all GET requests for the server.
 */
function getHandler(request, response){
	var url = require('url');
	var urlObj = url.parse(request.url, true);
	for(var prop in urlObj)
	{
		util.logger(util.LOG_TO_CONSOLE, "Property:" + prop + ' ' + urlObj[prop]);
	}
 
	for(var query in urlObj['query']){
		util.logger(util.LOG_TO_CONSOLE, "Query:" + query);
	}
	
	response.end();
}


