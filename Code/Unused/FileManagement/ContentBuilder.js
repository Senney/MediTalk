/**
 *	@fileOverview Content Builder is a class designed to handle the creation of HTML files that are served up to the
 *	client.
 *	@author Sean Heintz
 */

// The maximum amount of times to recurse into the function.
const MAX_RECURSE = 10;

/**
 * Parse a file.
 * @param path		Path of the file to parse.
 * @param fileManager	File manager for this instance.
 * @param callback	Callback to run after the file has been parsed.
 * @param [recursion]	Number of times to recurse into files. Optional.
 */
var parseFile = function(path, fileManager, callback, recursion) {
	// If we only have 4 arguments, then recursion is not defined.
	if (recursion == undefined)
		recursion = MAX_RECURSE;
		
	// Grab the file from the manager.
	fileManager.getFile(path, false, function(err, data) {
		// Parse our loaded data.
		if (!err)
			doParse(fileManager, data, callback, recursion);
		else {
			callback(err, data);
		}
	});
}

/**
 * Parse the file specified file.
 * @param fileManager	Current instance of FileManager.
 * @param data		Data which we're currently parsing.
 * @param callback	Callback to be run after the function has finished. Has err, data params.	
 * @param recursion	Number of times to recurse.
 */
function doParse(fileManager, data, callback, recursion) {
	var error = undefined;
	
	// Escape clause if we're recursing.
	if (recursion == 0) {
		callback(error, data);
		return;
	}
	
	// Look for expressions of the type {{*}}
	var reg = new RegExp("{{(.*?)}}", "gm");
	
	// Find all the matches.
	var matches = data.match(reg);
	if (matches == null) {
		callback(error, data);
		return;
	}
	
	// Loop through all the matches that our regex pulls out.
	for (var i = 0; i < matches.length; i++) {
		// Chop off the brackets.
		var command = (matches[i].slice(2, -2)).split(' ');
		var type = command[0];
		
		// Parse a file.
		if (type == 'f' && command.length == 2) {
			var filename = command[1];
			
			// Recursively call parseFile and modify the data based on the recursion.
			parseFile(filename, fileManager, function(err, file) {
				if (err) {
					error = err;
				}
				else {
					// Chop off the newline that is from the end of the file.
					file = file.slice(0, -1);
					
					// Replace it!
					data = data.replace(matches[i], file);
				}
			}, recursion - 1);
		}
	}
	
	// Run our callback
	callback(error, data);
}

exports.parseFile = parseFile;
