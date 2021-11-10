// Server
const express = require('express');
const app = express();
const port = 8000;
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());
const { auth } = require("./middleware/auth");


app.listen(port, () => {
	console.log(`Server running on Port #${port}`);
})

// Database
const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://arthur:qwer1234@introfsd.xw0p9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(mongoURI)
	.then(console.log("DB Connected!"))
	.catch(err => {console.log(err)})

// Sign up
const { User } = require('./models/User');

app.get('/', (req, res) => {
	return res.send("Testing")
})

app.post('/signup', (req, res) => {
	const user = new User(req.body);

	user.save((err, doc) => {
		if (err) return res.json({ signupSuccess : false});
		return res.status(200).json({ signupSuccess : true});
	})
})

// Login
app.post('/login', (req, res) => {
	// 1. Find whether or not the ID exists
	User.findOne({ id : req.body.id }, (err, user1) =>{
		if(err) return res.json({ loginSuccess : false})
		if(!user1) return res.json({loginSuccess : false, msg : "ID not found"});

		// 2. If the ID exists, compare the password with
		// the one in the DB.
		user1.comparePassword(req.body.password, (err, isMatch) =>{
			if(err) return res.json({ loginSuccess : false});
			if(!isMatch) return res.json({loginSuccess : false, msg : "PW does not match!"});

			// 3. Create a Token and save it to the web cookie.
			user1.createToken((err, user2) => {
				if(err) return res.json({ loginSuccess : false, msg : "createToken err"});
				
				// Save that Token into the cookie.
				return res.cookie('x_auth', user2.token)
									.status(200)
									.json({ loginSuccess : true, token : user2.token});
			})
		})
	})
})


app.get('/auth', auth, (req, res) => {
	res.status(200).json({
		// _id : req.user._id,
		user : req.user
	});
})

app.get('/logout', auth, (req, res) => {
	User.findByIdAndUpdate({ _id : req.user._id }, { token : "" }, (err, user) => {
		if(err) return res.json({ logoutSuccess : false });

		return res.status(200).json({ logoutSuccess : true });
	})
})