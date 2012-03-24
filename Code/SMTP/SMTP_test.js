/**
 *	@fileOverview Testing for the SMTP library.
 *	@author Sean Heintz
 */
 
const clients = ["sean.heintz@gmail.com"/*, "nissenkyle@gmail.com", "shugo841@gmail.com", "cb.burleigh@gmail.com"*/];

var smtp = require("./SMTP");
var fileManager = require("../FileManagement/FileManager");
var util = require("../Util/util");

this.doTest = function() {
	fileManager.getFile("../Static/Tests/EmailTest.html", false, function(error, data) {
		if (error) {
			util.logger(util.LOG_TO_CONSOLE, "ERROR: Could not load file properly.");
			return;
		}
		
		for (var c in clients) {
			var client = clients[c];
			util.logger(util.LOG_TO_CONSOLE, "Sending mail to: " + client);
			smtp.sendMail(client, "Meditalk Staff", "SMTP Server Progress", data, function(error) {
				if (error) {
					util.logger(util.LOG_TO_CONSOLE, "Failed sending mail to " + client);
				} else {
					util.logger(util.LOG_TO_CONSOLE, "Test passed sending mail to " + client);
				}
			});
		}
	});
}

this.doTest();