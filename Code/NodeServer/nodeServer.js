/**
 * 
 */


var http = require('http');
var server = http.createServer();

//The path to the root of the server file system
const ROOT_DIRECTORY = ".";

//Constants for different error types mapped to http status codes
const ACTION_NOT_FOUND = 404;
const URL_NOT_FOUND = 404;
const INVALID_FILE_EXTENSION = 415;
const FILE_EXISTS = 409;
const FILE_IO_ERROR = 500;
const READ_ERROR = 408;

//Constants for logging options
const LOG_TO_CONSOLE = 69;


/**
 * Set the server to listen for 'request' events
 */
server.on('request', function(request, response){
	if(request.method == 'GET'){
		logger(LOG_TO_CONSOLE, new Date() + " -- GET Request recieved: " + request.url);
		getHandler(request, response);
	}
	else if(request.method == 'POST'){
		logger(LOG_TO_CONSOLE, new Date() + " -- POST Request recieved: " + request.url);
		postHandler(request, response);	
	}
});

