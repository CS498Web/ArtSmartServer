var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	worksAnnotaded: [{
		type: String
	}]
});

module.exports = mongoose.model('User', UserSchema);