var cBuilder = require("./ContentBuilder");
var fileM = require("./FileManager");
var util = require("../Util/util");

const PARSE_FILE = "TestContent/FM/parseme.txt";
const RECURSE_FILE = "TestContent/FM/recurse.txt";

var testContentBuild = function(callback) {
	cBuilder.parseFile(PARSE_FILE, fileM, function(err, data) {
		callback(data);
	});
}

var testContentRecurse = function(callback) {
	cBuilder.parseFile(RECURSE_FILE, fileM, function(err, data) {
		callback(data);
	});
}

var runTests = function(test) {
	util.logger(util.LOG_TO_CONSOLE, "Running ContentBuilder tests.");
	test(testContentBuild, "TestData\n", "testContentBuild");	
	test(testContentRecurse, "{{f recurse.txt}}\n", "testContentRecurse");
}

exports.runTests = runTests;
