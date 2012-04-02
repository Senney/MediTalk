/**
 * @fileOverview Test functionality of various modules.
 * @author Sean Heintz
 **/
 
/**
 * Constant values describing events in our tests.
 */
const PASS = "Test Passed";
const FAIL = "Test Failed";

// Load in our libraries. 
var fileManager = require("./FileManagement/FileManager_tests");
var cBuilder = require("./FileManagement/ContentBuilder_tests");
var util = require("./Util/util.js");

// Here we run the tests.
var runTests = function() {
	fileManager.runTests(doTest);
	cBuilder.runTests(doTest);
}

/**
 * Runs a test and checks the result against the expected result.
 * @param func		The test function to be run. The test must have a callback function with an
 			error argument and a data argument.
 * @param expected 	The expected result.
 * @param message	The message to print to the console describing the test.
 */
var doTest = function(func, expected, message) {
	util.logger(util.LOG_TO_CONSOLE, message);
	func(function(result) {
		if (expected == result) {
			util.logger(util.LOG_TO_CONSOLE, PASS + ": " + message);
		} else {
			util.logger(util.LOG_TO_CONSOLE, FAIL + ": " + message);
		}
	});
}

runTests();
