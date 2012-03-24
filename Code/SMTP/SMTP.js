/**
 *	@fileOverview A wrapper for the SMTPC library for Node.
 *	@author Sean Heintz
 */
 
var smtp = require("nodemailer/lib/nodemailer");
var util = require("../Util/util");

/**
 * Constants that relate to the email that we're using.
 * TODO: Write a configuration file + parser.
 */
const EMAIL = "301meditalk@gmail.com";
const PASSW = "CPSC301_Platypus";
const CTYPE = "text/html";

/**
 * Handles sending of mail to users.
 * @param path 	  	The path of the file in relation to the content directory.
 * @param cache		A boolean value defining if the file should be cached.
 * @param callback	A callback function to be run when the file has been loaded. The callback function
 *			should be constructed in the format of -- function(error, data).
 */
this.sendMail = function(receiver, fullname, mailsubject, content, callback) {
	if (arguments.length < 4) {
		util.logger(util.LOG_TO_CONSOLE, "sendMail requires at least 4 arguments.");
		return;
	}

	var transport = smtp.createTransport("SMTP", {
		service: 'Gmail',
		auth: {
			user: EMAIL,
			pass: PASSW
		}
	});
	
	var message = {
		from: 'Meditalk Admin <301meditalk@gmail.com>',
		to: '"' + fullname + '"' + ' <' + receiver + '>',
		subject: mailsubject,
		html: content
	};
	
	transport.sendMail(message, function(error){
		if (callback != undefined) {
			callback(error);
		}
		if (error)
			return;
		transport.close();
	});
}