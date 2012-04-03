var db = require('./Database/DatabaseWrapper.js');

// Setup the default streams
db.newSection(0, "Memos", "Important new releases pertaining to the hospital.");
db.newSection(0, "General Discussion", "General chit-chat.");
db.newSection(0, "Research and Articles", "A sharing place for new-found research and articles.");
