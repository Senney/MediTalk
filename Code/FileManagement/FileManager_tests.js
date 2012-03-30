/**
 * @fileOverview Test the functon
 * @author Sean Heintz
 **/
 
/**
 * Constant values describing events in our tests.
 */
const TEST_FILE = "TestContent/FM/testData.txt";
const NOT_FOUND = "TestContent/FM/FalseFile.txt";

// Load in our libraries. 
var fileManager = require("./FileManager.js");
var util = require("../Util/util.js");

/**
 * Tests the file loading capability without saving to the cache.
 * @param callback	A function to be run after the test has been executed.
 */
var loadFileTestNoCache = function(callback) {
	fileManager.getFile(TEST_FILE, false, function(err, data) {
		callback(data);
	});
}

/**
 * Tests the file loading capability with saving to the cache.
 * @param callback	A function to be runa fter the test has been executed.
 */
var loadFileTestCache = function(callback) {
	fileManager.getFile(TEST_FILE, true, function(err, data) {
		var cacheContents = fileManager.getCacheContents();
		callback(cacheContents);
	});
}

/** 
 * Tests the error handling capabilities of the file manager.
 * @param callback	A functionto be runa fter the test has been executed.
 */
var fileNotFound = function(callback) {
	fileManager.getFile(NOT_FOUND, false, function(err, data) {
		callback(err.code);
	});
}

/**
 * A function to run various tests on a module.
 * @param test		A function which runs a test - Must have 3 arguments: function, expected, message
 */
var runTests = function(test) {
	util.logger(util.LOG_TO_CONSOLE, "Running FileManager tests.");
	test(loadFileTestNoCache, "TestData\n", "loadFileTestNoCache");
	test(loadFileTestCache, "testData.txt ", "loadFileTestCache");
	test(fileNotFound, 'ENOENT', "fileNotFound");
}

exports.runTests = runTests;
