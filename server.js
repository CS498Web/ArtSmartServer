// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
//var Llama = require('./models/llama');
var User = require('./models/user');
var Task = require('./models/task');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://rlarson2:buddy5694@ds019990.mlab.com:19990/cs498mp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

//Llama route
//var llamaRoute = router.route('/llamas');
var usersRoute = router.route('/users');
var tasksRoute = router.route('/tasks');
var userRoute = router.route('/users/:id');
var taskRoute = router.route('/tasks/:id');

usersRoute.get(function(req, res) {  //NEED TO ADD THE SPECIFIC STUFF  /api/users?where = {}&sort=___&cont
	var query = User.find(); 
	var whereQuery = req.query["where"];
	var sortQuery = req.query["sort"];
	var selectQuery = req.query["select"];
	var skipQuery = req.query["skip"];
	var limitQuery = req.query["limit"];
	var countQuery = req.query["count"];
	 console.log(whereQuery);
	 if(whereQuery==undefined) {
	 	whereQuery="{}";
	 }
	 var wherejson = JSON.parse(whereQuery);
	 query.where(wherejson);
	 if(sortQuery) {
	 	query.sort(JSON.parse(sortQuery));
	 }
	if(selectQuery) {
		query.select(JSON.parse(selectQuery));
	}
	if(skipQuery && !isNaN(parseInt(skipQuery))) {
		query.skip(skipQuery);
	}
	if(limitQuery && !isNaN(parseInt(limitQuery))) {
		query.limit(limitQuery);
	}
	if(Boolean(countQuery)){
		query.count();
	}
        query.exec(function (err, users) {
                if (err)
                    res.status(500).json({ message: 'Could not complete request', data: [] });

                else
                    res.status(200).json({ message: 'Completed Request', data: users });
            })
});

usersRoute.post(function(req, res) {  //done
	var user = new User();

	user.name = req.body.name;
	user.email = req.body.email;
	user.pendingTasks = req.body.pendingTasks;
	user.dateCreated = Date.now();
	if(!user.pendingTasks){
		user.pendingTasks = [];
	}
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

usersRoute.options(function(req, res){  //done
      res.writeHead(200);
      res.end();
});

userRoute.get(function(req, res) {  //done
	User.findById(req.params.id, function(err, user){
        if(err){ 
            res.status(500);
            res.json( { message: 'Error finding User', data: [] } );
        }
        else if(!user){
        	res.status(404);
        	res.json( { message: 'User not found', data: [] } );
        }
        else {
            res.status(200);
            res.json({ message: 'Found User', data: user } );
        }
	});
});

userRoute.put(function(req, res) {  //done
	User.findById(req.params.id, function(err, user){
		if(err){
			res.status(404);
			res.json( { message: 'User not found', data: [] } );
		}

		if(!req.body.pendingTasks)
            user.pendingTasks = [];
        else 
            user.pendingTasks = req.body.pendingTasks;

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

tasksRoute.get(function(req, res) {  //NEED TO ADD THE SPECIFIC STUFF
	var query = Task.find(); 
	var whereQuery = req.query["where"];
	var sortQuery = req.query["sort"];
	var selectQuery = req.query["select"];
	var skipQuery = req.query["skip"];
	var limitQuery = req.query["limit"];
	var countQuery = req.query["count"];
	 console.log(whereQuery);
	 if(whereQuery==undefined) {
	 	whereQuery="{}";
	 }
	 var wherejson = JSON.parse(whereQuery);
	 query.where(wherejson);
	 if(sortQuery) {
	 	query.sort(JSON.parse(sortQuery));
	 }
	if(selectQuery) {
		query.select(JSON.parse(selectQuery));
	}
	if(skipQuery && !isNaN(parseInt(skipQuery))) {
		query.skip(skipQuery);
	}
	if(limitQuery && !isNaN(parseInt(limitQuery))) {
		query.limit(limitQuery);
	}
	else {
		query.limit(100)
	}
	if(Boolean(countQuery)){
		query.count();
	}
        query.exec(function (err, users) {
                if (err)
                    res.status(500).json({ message: 'Could not complete request', data: [] });

                else
                    res.status(200).json({ message: 'Completed Request', data: users });
            })
});

tasksRoute.post(function(req, res) { //done
	var task = new Task();

    task.name = req.body.name;
    task.description = (req.body.description ? req.body.description : "");
    task.deadline = req.body.deadline;
    task.completed = (req.body.completed ? req.body.completed : false);
    task.assignedUser = (req.body.assignedUser ? req.body.assignedUser : "");
    task.assignedUserName = (req.body.assignedUserName ? req.body.assignedUserName : "unassigned");
    task.dateCreated = Date.now();


    task.save(function(err) {
        if (err){
            res.status(500);
        	res.json({ message: 'Could not add task', data: [] });
        }
        else
            res.status(201);
        	res.json({ message: 'Added to task', data: task });
    });
});

tasksRoute.options(function(req, res){  //done
      res.writeHead(200);
      res.end();
});

taskRoute.get(function(req, res) { //done
    Task.findById(req.params.id, function(err, task){
        if(err)
            res.status(500).json({ message: 'Server error', data: [] });
        else if(!task){
        	res.status(404).json({ message: 'Unable to complete request', data: [] });
        }
        else
            res.status(200).json({ message: 'Completed Request', data: task });
    });
});

taskRoute.put(function(req, res) {  //done

    Task.findById(req.params.id, function(err, task) {

        if (err){
            res.status(500);
            res.json({ message: 'Unable to complete request: Server Error', data: [] });
        }
        if(!task){
        	res.status(404);
            res.json({ message: 'Task not found', data: [] });
        }
        task.name= req.body.name;
        task.description= req.body.description || "";
        task.deadline= req.body.deadline;
        task.completed= req.body.completed  || false;
        task.assignedUser= req.body.assignedUser  || "";
        task.assignedUserName= req.body.assignedUserName  || "unassigned";


        task.save(function(err) {
            if (err){
                res.status(500);
                res.json({ message: 'Server Error', data: err });
            }
            else{
                res.status(200);
                res.json({ message: 'Updated task', data: task });
            }
        });

    });
});

taskRoute.delete(function(req, res) {
    Task.findByIdAndRemove(req.params.id, function(err) {
        if (err){
            res.status(404);
            res.json({ message: 'Server error', data: err });
        }
        else{
            res.status(200);
        	res.json({ message: 'Task deleted', data:{} });
        }
    });
});
// llamaRoute.get(function(req, res) {
//   res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
// });

//Add more routes here

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
