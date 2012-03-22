// Includes
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

// The directory where the image files reside.
const fileDirectory = "Files/"
const hostPort = 10000;

// Error Codes
const OK_CODE = 200;
const NOT_FOUND_ERROR = 404;
const FILE_EXISTS_ERROR = 400;
const SERVER_ERROR = 500;

// The actions that we will allow the user to undertake
var types = new Array({type:"Action", args:1, handler:actionHandler}, {type:"Files", args:1, handler:fileHandler});

// Different events that can occur with each action.
var actions = new Array( {name: "list", handler: fileList, method: "GET"} );
var fileActions = new Array( {handler: sendFile, method: "GET"}, {handler: getFile, method: "POST"} );

// Allowed extensions.
var extensions = new Array(".png", ".jpeg", ".jpg");

console.log("IMAGE-SERVER - Sean Heintz - CPSC 301");
console.log("Starting server on port: " + hostPort);
// START THE SERVER.
var server = http.createServer(requestHandler).listen(hostPort);

/*
	Handle the incoming requests from the client.
	request - The request coming in from the client
	response - The response that we'll be sending back.
*/
function requestHandler(request, response) {		
	// Parse the url, so as to find the path.
	var pathName = url.parse(request.url).pathname;
	
	//Split based on /. Our next step will be stored in parts[1].
	var parts = pathName.split("/");	
	var action = parts[1];
	var found = false;
	
	for (var i = 0; i < types.length; i++) {
		// We subtract 2 because the first 2 elements are already accounted for.
		if (action == types[i].type && (parts.length - 2) == types[i].args) {
			console.log("Request received: " + request.method + " for " + pathName);
			types[i].handler(parts[2], request, response);
			found = true;
			break;
		}
	}
	if (!found) {
		console.log("Unknown type: " + action);
		errorHandler(NOT_FOUND_ERROR, request, response);
	}
}

/*
	Handles incoming files requests.
	file - The name of the file that we're working with.
	request - The current http request.
	response - The current http response.
*/
function fileHandler(file, request, response) {
	for (var i = 0; i < fileActions.length; i++) {
		if (fileActions[i].method == request.method) {
			fileActions[i].handler(file, request, response);
		}
	}
}

/*
	Handles incoming action requests.
	action - The name of the action that we're attempting to complete.
	request - The current http request.
	response - The current http response.
*/
function actionHandler(action, request, response) {
	for (var i = 0; i < actions.length; i++) {
		if (actions[i].name == action && actions[i].method == request.method) {
			actions[i].handler(request, response);
		}
	}
}

/*
	Parses the working directory looking for files that can be served.
	request - The http request.
	response - The http response.
*/
function fileList(request, response) {
	fs.readdir(fileDirectory, function(err, files) {	
		response.writeHead(OK_CODE, {'Content-Type:':'text/plain'});
		response.write("<h1>File List</h1>");
		if (files.length == 0) {
			response.write("<br/>No files currently located on the server.");
		}
		else {
			for (var i = 0; i < files.length; i++) {
				if (files[i] == "." || files[i] == ".." || !checkExt(getExt(files[i])))
					continue;
				response.write("<a href = '../Files/" + files[i] + "'>");
				response.write(files[i]);
				response.write("</a><br />");
			}
		}
		
		response.end();
	});
}

/*
	Extracts the file extension.
	filename - The file that we're extracting from.
	returns -> String - The file extension.
*/
function getExt(filename) {
	return path.extname(filename);
}

/*
	Extracts the file name, without extension.
	filename - The name of the file from which we're extracting.
	returns -> String - The name.
*/
function getName(filename) {
	var file = path.basename(filename);
	var re = /(^.*)\.[.]*$/
	var m = file.match(re);
	if (m.length > 2) {
		return m[1];
	} else {
		return '';
	}
}

/*
	Checks a file extension versus a list of accepted file types.
	filename - The file that we're working with.
	returns -> True - The extension is allowed
		   False - The extension is not allowed.
*/
function checkExt(ext) {
	for (var i = 0; i < extensions.length; i++) {
		if (ext == extensions[i])
			return true;
	}
	return false;
}

/*
	A function to get a file from the user and save it to disk.
	filename - The file name that we're saving as.
	request - The http request.
	response - The http response.
*/
function getFile(filename, request, response) {
	if (!checkExt(getExt(filename))) {
		console.log("Attempted upload of unsupported file extension.");
		errorHandler(FILE_EXISTS_ERROR, request, response);
		return;
	}
	
	// Load the file in to the request.
	request.setEncoding('binary');
	request.body = [];
	request.on('data', function(chunk) {
		request.body += chunk;
	});
	
	// When it's done, we write the file.
	// We do error checking in here, just due to the volatility of the data that we're working with.
	request.on('end', function() {	
		path.exists(fileDirectory + filename, function(exists) {
			if (exists) {
				console.log(filename + " already exists on the server.");
				errorHandler(FILE_EXISTS_ERROR, request, response);
			} else {
				fs.writeFile(fileDirectory + filename, request.body, 'binary', function(err) {				
					if (err) {
						console.log("Error while writing " + filename);
						errorHandler(SERVER_ERROR, request, response);
					} else {
						response.writeHead(OK_CODE, {'Content-Type':'text/plain'});
						response.write("File Upload: File uploaded successfully!");
						response.end();
					}
				});
			}
		});
	});
}

/*
	A function to send a file to the user.
	filename - The name of the file to send.
	request - The http request
	response - The http response
*/
function sendFile(filename, request, response) {
	fs.readFile(fileDirectory + filename, function(err, data) {
		if (err) {
			console.log("Request for " + filename + " failed." + err);
			errorHandler(NOT_FOUND_ERROR, request, response);
		} else {
			response.writeHead(OK_CODE, {'Content-Type':'image/' + getExt(filename)});
			response.write(data);
			response.end();
		}
	});
}


/*
	A function to handle various types of http errors.
	type - The type of error being thrown. An http status code.
	request - The http request.
	response - The http response.
*/
function errorHandler(type, request, response) {
	response.writeHead(type, {'Content-Type':'text/plain'});
	switch(type) {
		case FILE_EXISTS_ERROR:
			response.write("<h1>Bad File Upload</h1><br />The file that you attempted to upload either already exists or was malformed.");
			break;
		case NOT_FOUND_ERROR:
			response.write("<h1>404 Not Found</h1><br />File not found on server.<br />" + request.url);
			break;
		case SERVER_ERROR:
			response.write("<h1>500 Server Error</h1><br />Something went wrong on our end! Sorry about that.<br />" + request.url);
			break;
	}
	response.end()
}
