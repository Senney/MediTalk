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
var sBuilder = require("./StreamBuilder/StreamBuilder_tests")
var util = require("./Util/util.js");

// Here we run the tests.
var runTests = function() {
	fileManager.runTests(doSimpleTest);
	cBuilder.runTests(doSimpleTest);
	sBuilder.runTests(doTest);
}

/**
 * Runs a test and checks the result for strict equality against the expected result.
 * @param func		The test function to be run. The test must have a callback function with an
 			error argument and a data argument.
 * @param expected 	The expected result.
 * @param message	The message to print to the console describing the test.
 */
var doSimpleTest = function(func, expected, message) {
	doTest(func, expected, function(a,b) { return a==b }, message)
}

/**
 * Runs a test and runs the provided equality function to compare the results.
 * @param func		The test function to be run. The test must have a callback function with an
 			error argument and a data argument.
 * @param expected 	The expected result.
 * @param equals	The equality function(func(a,b) -> returns true if a is equal to b, false otherwise.)
 * @param message	The message to print to the console describing the test.
 */
 var doTest = function(func, expected, equals, message) {
	util.logger(util.LOG_TO_CONSOLE, message);
	func(function(result) {
		testMsg(equals(expected, result), message)
	});
}
 
/**
	Receives a test result and prints corresponding message.
	@param	pass	whether the test passed or not
	@param message	the message to print to the console describing the test
*/
	
function testMsg(pass, message)
{
	if(pass)
		util.logger(util.LOG_TO_CONSOLE, PASS + ": " + message);
	else
		util.logger(util.LOG_TO_CONSOLE, FAIL + ": " + message);
}

runTests();
