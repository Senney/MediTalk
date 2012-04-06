var db = require('./Database/DatabaseWrapper.js');

const DEFAULT_USER = 'meditalk'
const DEFAULT_PASS = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // password

// Setup the default streams
db.newSection(0, "Memos", "Important new releases pertaining to the hospital.");
db.newSection(0, "General Discussion", "General chit-chat.");
db.newSection(0, "Research and Articles", "A sharing place for new-found research and articles.");

// Create a new default user.
db.newUser(DEFAULT_USER, DEFAULT_PASS, '301meditalk@gmail.com', 'MediTalk', 'Admin', '1');

// Create a default post.
db.newPost(0, "Welcome to MediTalk", "Welcome, friend, to MediTalk. This is a default post.", "meditalk", "Memos");
