var mongoose = require('mongoose');

var ArtworkSchema = new mongoose.Schema({
	title: {
		type: String,
		default: ""
	},
	description: {
		type: String,
		default: ""
	},
	artists: [{
		type: String,
		default: ""
	}],
	originLocation: {
		type: String,
		default: ""
	},
	currentLocation: {
		type: String,
		default: ""
	},
	period: {
		type: String,
		default: ""
	},
	year: {
		type: Number,
		default: ""
	},
	medium: {
		type: String,
		default: ""
	},
	actualSize: {
		width : { type: Number, default: 0},
		height : { type: Number, default: 0},
		unit : { type:String, default: ""}
	},
	src: {
		type: String,
		default: ""
	},
	dateCreated: {
		type : Date,
		default : Date.now
	},
	uploadedById: {
		type : String, //userId
		default: ""
	},
	uploadedByName: {
		type : String, //userName
		default: ""
	},
	annotations: [
		{
			creatorId: { //userId
				type : String,
				default : ""
			},
			creatorName: { 
				type : String,
				default : ""
			},
			dateCreated: { 
				type : Date,
				default : Date.now
			},
			shapeType: {
				type: String,
				default: ""
			},
			relativeSegmentPoints: [{
				x : {type: Number, default: 0},
				y : {type: Number, default: 0}
			}],
			text: {
				type : String,
				default : ""
			},
			comments: [{
				userId: {
					type: String//Id of user
				},
				userName: {
					type: String//Id of user
				},
				dateCreated: {
					type : Date,
					default : Date.now
				},
				text: {
					type: String,
					default: ""
				}
			}]
		}
	]
});

module.exports = mongoose.model('Artwork', ArtworkSchema);