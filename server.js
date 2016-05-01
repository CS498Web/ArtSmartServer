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

//configuration of database
mongoose.connect('mongodb://artsmart:artsmart@ds011251.mlab.com:11251/artsmart');

//set up the express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.use(session({ secret: 'passport_demo' }));
app.use(express.static(__dirname + '/frontend'));


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
var artworkRoute = router.route('/artworks/:id');
var userRoute = router.route('/users/:id');

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
			res.json(docs);
		}
	});
});

artworkRoute.get(function(req, res) {
	Artwork.findById(req.params.id, function(error, doc) {
		if (error) {
			res.json({message: "could not find artwork"});
		}
		else {
			res.json(doc);
		}
	})
});

artworksRoute.post(function(req, res) {
	var artwork = new Artwork();

	artwork = req.body;

	artwork.save(function(error) {
		if (error) {
			res.json({message: "unable to create artwork"});
		}
		else {
			res.json({message: "created artwork"});
		}
	})
});

artworkRoute.put(function(req, res) {
	Artwork.findById(req.params.id, function(error, doc) {
		if (error) {
			res.json({message: 'artwork not found'});
		}
		else {
			doc = req.body;
		}

		doc.save(function(error) {
			if (error) {
				res.json({message: 'failed to save artwork'});
			}
			else {
				res.json({message: 'updated user'});
			}
		})
	})
});

artworkRoute.delete(function(req,res) {
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
			res.json(doc);
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
	res.send(true);
})

router.route('/signup').post(passport.authenticate('local-signup'), function(req, res){
	res.send(true);
})


app.listen(port);
console.log('Server running on port ' + port);
