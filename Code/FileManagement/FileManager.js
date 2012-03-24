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
 * Default content directory
 */
var content = "Static/"
 
/**
 * @name cache
 * @description Used to store cached files in to memory.
 *
 **/
var cache = {};
 
/**
 * Handles file loading and caching.
 * @param path 	  	The path of the file in relation to the content directory.
 * @param cache		A boolean value defining if the file should be cached.
 * @param callback	A callback function to be run when the file has been loaded. The callback function
 *			should be constructed in the format of -- function(error, data).
 */
this.getFile = function(path, cache, callback) {
	// Error flag.
	var error = false;

	// First we check to see if we have the object in the cache.
	if (cache[path] != undefined) {
		callback(error, data);
	}
	// Otherwise we load the file in, and cache it if the boolean is set.
	else {
		fs.readFile(content + path, function(err, data) {
			// Set our error flag
			if (err) {
				error = err;
				util.logger(util.LOG_TO_CONSOLE, "ERROR loading file " + content + path);
			} else {
				if (cache != undefined && cache == true)
					cache[path] = data;
				callback(error, data);
			}
		});
	}
}

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
