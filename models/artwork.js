var mongoose = require('mongoose');

var ArtworkSchema = new mongoose.Schema({
	title: {
		type: String
	},
	artists: [{
		type: String
	}],
	location: {
		type: String
	},
	period: {
		type: String
	},
	year: {
		type: String
	},
	media: {
		type: String
	},
	actualSize: [{
		type: String
	}],
	src: {
		type: String
	},
	annotations: [
		{
			user: {
				type: String
			},
			shape: {
				type: String
			},
			relX: {
				type: Number
			},
			relY: {
				type: Number
			},
			relRadius: {
				type: Number
			},
			text: {
				type: String
			},
			comments: [{
				user: {
					type: String
				},
				text: {
					type: String
				}
			}]
		}
	]
});

module.exports = mongoose.model('Artwork', ArtworkSchema);