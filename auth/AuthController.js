var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config/config');
var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');

router.post('/login', (req, res) => {
	User.findOne({ email: req.body.email }, (err, user) => {
		if (err) 
			return res.status(500).send('Error on the server.');
		if (!user) 
			return res.status(404).send('No user found.');
		
		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		if (!passwordIsValid) 
			return res.status(401).send({ auth: false, token: null, message: 'Incorrect Password' });
		
		jwt.sign({ id: user._id }, config.secret, { expiresIn: 360 }, (err, token) =>{
			res.status(200).send({ auth: true, token: token });
		});		
	});
});

router.post('/register', (req, res) => {
	var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  
	User.create({
		name : req.body.name,
		email : req.body.email,
		password : hashedPassword
	}, (err, user) => {
		if (err) 
			return res.status(500).send("There was a problem registering the user.")
		
		// create a token
		jwt.sign({ id: user._id }, config.secret, { expiresIn: 360 }, (err, token) => {
			res.status(200).send({ auth: true, token: token });
		});		
	}); 
});

router.get('/logout', (req, res) => {
	res.status(200).send({ auth: false, token: null, message: 'You logged out' });
});

router.get('/me', VerifyToken, (req, res) => {
	User.findById(decoded.id, { password: 0 }, (err, user) => {
		if (err) 
			return res.status(500).send("There was a problem finding the user.");
		if (!user) 
			return res.status(404).send("No user found.");
		
		res.status(200).send(user);
	});
});

module.exports = router;