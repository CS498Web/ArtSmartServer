var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs')

var userSchema = new mongoose.Schema({
	name: {
		type: String,
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
		type: String  //Id of the works they have commented
	}],
	worksUploaded: [{
		type: String// Id of the works they uploaded
	}]
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);