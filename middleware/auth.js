const { User } = require('../models/User');
const cookieParser = require('cookie-parser');

let auth = function(req, res, next) {
	// Step 1. Lets get the token
	var token = req.cookies.x_auth;

	User.findByToken(token, (err, user) => {
		if(err) throw err;
		if(!user) res.json({ isAuth : false });

		req.token = token;
		req.user = user;
		next();
	});

	next();
}

module.exports = { auth };