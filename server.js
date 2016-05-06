// Get the packages we need
var express      = require('express');
var app          = express();
var port         = process.env.PORT || 4000;
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var router       = express.Router();
var configDB     = require('./config/database.js');  //THESE ALL WORK
var utils		 = require('./utility');
var _ 			 = require('underscore');
var AWS          = require('aws-sdk');
var uuid         = require('node-uuid'); 
var secrets      = require('./config/secrets.js'); 

//configuration of database
mongoose.connect('mongodb://artsmart:artsmart@ds011251.mlab.com:11251/artsmart');

//set up the express application
app.use(morgan('dev'));
app.use(cookieParser());
// app.use(bodyParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(session({ secret: 'passport_demo' }));
app.use(express.static(__dirname + '/frontend'));



//Amazon 
AWS.config.update({accessKeyId: secrets.AWS_CONFIG.accessKeyId, secretAccessKey: secrets.AWS_CONFIG.secretAccessKey});
AWS.config.region = secrets.AWS_CONFIG.region;

var s3 = new AWS.S3();


//models
var Artwork = require('./models/artwork.js');
var User = require('./models/user.js');



//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  next();
  
};
app.use(allowCrossDomain);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

require('./config/passport')(passport);
require('./config/routes')(app, passport);

//Default route here
var homeRoute = router.route('/');
var artworksRoute = router.route('/artworks');
var usersRoute = router.route('/users');
var artworkIdRoute = router.route('/artworks/:id');
var annotationIdRoute = router.route('/artworks/:artwork_id/annotations/:annotation_id');
var userRoute = router.route('/users/:id');
var amazonRoute = router.route('/amazon');

//HOME
homeRoute.get(function(req, res) {
  res.json({ message: 'ARTsmart Home. Go to /users or /artworks' });
});


//ARTWORK
artworksRoute.get(function(req, res) {
	Artwork.find(function(error, docs) {
		if (error) {
			res.json({message: "unable to retrieve users data"});
		}
		else {
			res.json({message: "success", data: docs});
		}
	});
});

artworkIdRoute.get(function(req, res) {
	Artwork.findById(req.params.id, function(error, doc) {
		if (error) {
			res.json({message: "could not find artwork"});
		}
		else {
			res.json({message: "success", data: doc});
		}
	})
});


/*function uploadImageToAWS(user, binaryImage, callback) {
	var userId = user._id;
	buf = new Buffer(binaryImage.replace(/^data:image\/\w+;base64,/, ""),'base64');
	var params = {
		Key: userId.toString(), 
		Body: buf,
		ContentEncoding: 'base64',
		ContentType: 'image/jpeg',
		ACL: 'public-read'
	};
	s3Bucket.upload(params, function(err, data) {
		if (err) {
		  console.log("Error uploading profile picture: ", err);
		} else {
		  console.log("Successfully uploaded image to AWS");
		  user.profile_picture_url = data.Location;
		}
		callback();
	});
};*/
 
artworksRoute.post(function(req, res) {
	var artwork = new Artwork(req.body);

	//add artwork to S3
	var mimeType = req.body.imageFile.split(';')[0];
	var fileType = mimeType.split('/')[1];
	var contentType = mimeType.split(':')[1];
	var buf = new Buffer(req.body.imageFile.replace(/^data:image\/\w+;base64,/, ""),'base64');
	console.log(fileType);
	console.log(contentType);
	s3.upload({
		Bucket: 'artsmartstorage',
		Key: uuid.v4() + '.' + fileType,             //replace with name of image
		Body: buf,
		ContentEncoding: 'base64',
		ContentType: contentType,
		ACL: 'public-read'
	}, function(error, response) {
		if (error) {
			console.log(error);
		}
		else {
			console.log("success");
			artwork.src = response.Location;
			console.log(response);
			artwork.save(function(error, successData) {
				if (error) {
					res.json({message: "unable to create artwork"});
				}
				else {
					res.json({
						message: "created artwork",
						data: successData
					});
				}
			})
		}
	}); 

	
});

artworkIdRoute.put(function(req, res) {
	Artwork.findById(req.params.id, function(error, doc) {
		if (error) {
			res.json({message: 'artwork not found'});
		}
		else {
			utils.updateDocument(doc, Artwork, req.body);
		}

		doc.save(function(error, successData) {
			if (error) {
				res.json({message: 'failed to save artwork'});
			}
			else {
				res.json({message: 'updated user', data: successData});
			}
		})
	})
});

artworkIdRoute.delete(function(req,res) {
	Artwork.findById(req.params.id, function(error, doc) {
		if (error) {
			res.json({message: 'cant find artwork'});
		}
		else {
			Artwork.findByIdAndRemove(req.params.id, function(error) {
				if (error) {
					res.json({message: 'failed to delete user'});
				}
				else {
					res.json({message: "deleted user"});
				}
			})
		}
	})
})

annotationIdRoute.delete(function(req,res) {
	Artwork.findById(req.params.artwork_id, function(error, doc) {
		if (error) {
			res.json({message: 'cant find artwork'});
		}
		else {
			doc.annotations.pull({ _id: req.params.annotation_id })
			doc.save(function(error) {
				if (error) {
					res.json({message: 'failed to delete annotation'});
				}
				else {
					res.json({message: 'annotation deleted'});
				}
			})
		}
	})
})

//USERS
usersRoute.get(function(req, res) {
	User.find(function(error, docs) {
		if (error) {
			res.json({message: "users not found"});
		}
		else {
			res.json(docs);
		}
	});
});

userRoute.get(function(req, res) {
	User.findById(req.params.id, function(error, doc) {
		if (error) {
			res.json({message: "user not found"});
		}
		else {
			res.json({message: "user found", data: doc});
		}
	});
})

usersRoute.post(function(req, res) {  //done
	var user = new User();

	user.name = req.body.name;
	user.password = req.body.password;
	user.email = req.body.email;
	user.worksAnnotaded = req.body.worksAnnotaded;
	user.worksUploaded = req.body.worksUploaded;

	user.save(function(err) {
		if(err){
			res.status(500);
			res.json( { message: 'Failed to create user', data: [] } );
		}
		else {
			res.status(201);
			res.json( { message: 'Created User', data: user } );
		}
	});
});

userRoute.put(function(req, res) {  //done
	User.findById(req.params.id, function(err, user){
		if(err){
			res.status(404);
			res.json( { message: 'User not found', data: [] } );
		}
		utils.updateDocument(user, User, req.body);
        user.save(function(err, user) {
            if (err){
                res.status(500);
            	res.json({ message: 'Failed to save user', data: [] });
            }
            else{
                res.status(200);
                res.json({ message: 'Updated User', data: user } );
            }
        });
	});
});

userRoute.delete(function(req, res) {  //done
	User.findById(req.params.id, function(err, user){
		if(err){
			res.status(500);
			res.json( { message: 'Error finding database', data: [] } );
		}
		else if(!user){
			res.status(404);
			res.json( { message: 'User not found to delete', data: [] } );
		}
		else{
			User.findByIdAndRemove(req.params.id, function(err) {
				if(err){
					res.status(404);
					res.json( {message: 'Failed to delete user', data: [] } );
				}
				else {
					res.status(200);
					res.json( {message: 'Deleted User', data: [] } );
				}
			});
		}
	});
});

router.route("/login").post(passport.authenticate("local-login"), function(req, res){
	res.json({ id: req.user.id, name: req.user.name });
})

router.route('/signup').post(passport.authenticate('local-signup'), function(req, res){
	res.json({ id: req.user.id, name: req.user.name });
})

router.route('/logout').delete(function(req, res){
 	req.logout();
 	res.json({ message: "successfully logged out" });
});


app.listen(port);
console.log('Server running on port ' + port);
