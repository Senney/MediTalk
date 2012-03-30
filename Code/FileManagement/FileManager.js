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
this.cache = new Object;
 
/**
 * Extracts the extension from the filename.
 * @param path		The path of the file from which to extract the extension.
 */
var getExtension = function(filePath) {
	return path.extname(filePath);
}

/**
 * Extracts the name of the file specified.
 * @param path		The path of the file from which to extract the filename.
 */
var getFilename = function(filePath) {
	return path.basename(filePath);
}

/**
 * Handles file loading and caching.
 * @param path 	  	The path of the file in relation to the content directory.
 * @param cache		A boolean value defining if the file should be cached.
 * @param callback	A callback function to be run when the file has been loaded. The callback function
 *			should be constructed in the format of -- function(error, data).
 */
var getFile = function(path, cacheFlag, callback) {
	// Extract the filename
	var fileName = this.getFilename(path);

	// First we check to see if we have the object in the cache.
	if (this.cache[fileName] != undefined) {
		callback(false, this.cache[fileName]);
	}
	// Otherwise we load the file in, and cache it if the boolean is set.
	else {
		var newCache = this.cache;
		fs.readFile(path, "utf8", function(err, data) {
			// Set our error flag
			if (!err) {
				if (cacheFlag != undefined && cacheFlag == true) {
					newCache[fileName] = data;
				}
			}
			callback(err, data);
		});
		this.cache = newCache;
	}
}

/**
 * Gets the contents of the cache.
 * @returns	{String} A string containing the alphanumeric indicies of the cache.
 */
var getCacheContents = function() {
	var contents = "";
	for (var k in this.cache)
		contents += k + " ";
	return contents;
}

// Export our functions for this module.
exports.getFile = getFile;
exports.getCacheContents = getCacheContents;
exports.getExtension = getExtension;
exports.getFilename = getFilename;
