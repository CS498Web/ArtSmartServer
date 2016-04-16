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
	size: [{
		type: String
	}],
	src: {
		type: String
	},
	annotations: [
		{
			shape: {
				type: String
			},
			x: {
				type: Number
			},
			y: {
				type: Number
			},
			radius: {
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