module.exports = function(app, passport){
	app.post('/signup', passport.authenticate('local-signup'), function(req, res){
		res.send(true);
	});


	app.post("/login", passport.authenticate('local-login'), function(req, res){
		res.send(true);
	})
}