/**
 * @fileOverview File Manager handles loading content from files and returning them for use
 * in other parts of the server.
 * @author Sean Heintz
 **/
 
/**
 * Import the required libraries.
 */
var fs = require("fs");
var util = require("../Util/util.js");
var path = require("path");
 
/**
 * @name cache
 * @description Used to store cached files in to memory.
 *
 **/
this.cache = {};
 
/**
 * Extracts the extension from the filename.
 * @param path		The path of the file from which to extract the extension.
 */
this.getExtension = function(path) {
	return path.extname(path);
}

/**
 * Extracts the name of the file specified.
 * @param path		The path of the file from which to extract the filename.
 */
this.getFilename = function(path) {
	return path.basename(path);
}

/**
 * Handles file loading and caching.
 * @param path 	  	The path of the file in relation to the content directory.
 * @param cache		A boolean value defining if the file should be cached.
 * @param callback	A callback function to be run when the file has been loaded. The callback function
 *			should be constructed in the format of -- function(error, data).
 */
this.getFile = function(path, cacheFlag, callback) {
	// Error flag.
	var error = false;

	// First we check to see if we have the object in the cache.
	if (this.cache[path] != undefined) {
		callback(error, data);
	}
	// Otherwise we load the file in, and cache it if the boolean is set.
	else {
		console.log(this.cache);
		fs.readFile(path, function(err, data) {
			// Set our error flag
			if (err) {
				error = err;
				util.logger(util.LOG_TO_CONSOLE, "ERROR loading file " + path);
			} else {
				if (cacheFlag != undefined && cacheFlag == true) {
					
				}
			}
			callback(error, data);
		});
	}
}

/**
 * Gets the contents of the cache.
 */
this.getCacheContents = function() {
	var contents = "{";
	
	for (var k in this.cache) {
		contents += k + ",";
	}
	
	contents += "}";
		
	return contents;
}

