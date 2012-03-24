/**
 * @fileOverview Test the functon
 * @author Sean Heintz
 **/
 
/**
 * Constant values describing events in our tests.
 */
const PASS = "Test Passed";
const FAIL = "Test Failed";
const TEST_FILE = "Test_Content/testData.txt";

// Load in our libraries. 
var fileManager = require("./FileManager.js");
var util = require("../Util/util.js");

// Here we run the tests.
this.runTests = function() {
	util.logger(util.LOG_TO_CONSOLE, "Running FileManager tests.");
	this.doTest(this.loadFileTestNoCache, "TestData\n", "loadFileTestNoCache");
	this.doTest(this.loadFileTestCache, "TestData\n", "loadFileTestCache");
}

/**
 * Runs a test and checks the result against the expected result.
 * @param func		The test function to be run. The test must have a callback function with an
 			error argument and a data argument.
 * @param expected 	The expected result.
 * @param message	The message to print to the console describing the test.
 */
this.doTest = function(func, expected, message) {
	util.logger(util.LOG_TO_CONSOLE, message);
	func(function(err, result) {
		if (!err && expected == result) {
			util.logger(util.LOG_TO_CONSOLE, PASS + ": " + message);
		} else {
			util.logger(util.LOG_TO_CONSOLE, FAIL + ": " + message);
		}
	});
}

this.loadFileTestNoCache = function(callback) {
	fileManager.getFile(TEST_FILE, false, function(err, data) {
		callback(err, data);
	});
}

this.loadFileTestCache = function(callback) {
	fileManager.getFile(TEST_FILE, true, function(err, data) {
		var cacheContents = fileManager.getCacheContents();
		callback(err, cacheContents);
	});
}

this.runTests();

