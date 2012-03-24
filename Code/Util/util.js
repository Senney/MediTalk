/**
 * 	 @fileOverview The class contains several methods (well one just now) that are used to log 
 * 	 information to different locations (again, just one right now).  
 *   @author Kyle Nissen
 *   
 */


/**
 * @constant LOG_TO_CONSOLE
 * @description Used for logging information directly to the console
 */
this.LOG_TO_CONSOLE =  1;


/**
 * Handles logging messages for the server
 * @param logCode Code that determines where the information is logged to
 * @param msg     Message that will be logged to the specified location
 */
this.logger = function logger(logCode, msg){
	switch(logCode)
	{
	default:	
	case this.LOG_TO_CONSOLE:
		console.log(msg);
		break;
	}
};
