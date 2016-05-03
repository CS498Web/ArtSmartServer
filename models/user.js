var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs')

var UserSchema = new mongoose.Schema({
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

UserSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', UserSchema);