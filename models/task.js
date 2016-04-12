// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var LlamaSchema   = new mongoose.Schema({
    name: { type:String, required:true },
    description: String,
    deadline: { type:Date, required:true },
    completed: Boolean,
    assignedUser: String,
    assignedUserName: String,
    dateCreated: Date
});

// Export the Mongoose model
module.exports = mongoose.model('Task', LlamaSchema);
