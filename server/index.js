/** Step 1.
 * Import necessary packages & dependencies such as express.js, cookie parser, and auth.js file.
 * Remember you can see the full list of depencies used for this project in package.json under 'dependencies.'
 * Require is used to import modules rather than 'import' in JavaScript. If you are curious about the
 * exact difference, here is a link to an article that describes the difference.
 * https://flexiple.com/javascript-require-vs-import/
 */
const express = require("express");
const app = express();
const port = 8000;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
app.use(express.json());
app.use(cookieParser());

/** Step 2.
 * Here we boot up the server using one of the ports on your local machine (laptop).
 * There are many ways for you to establish a server, but here we are using the app.listen() method.
 * Below is an Hello World example from the express.js website.
 * https://expressjs.com/en/starter/hello-world.html
 */
app.listen(port, () => {
  console.log(`Server running on Port #${port}`);
});

/** Step 3.
 * Here we connect the server with a MongoDB database using a helper module named 'mongoose.'
 * Remember to input your own unique Mongo id & password in the URI to access your database.
 * Below is a description of the mongoose.connect() method from the mongoose website.
 * https://mongoosejs.com/docs/connections.html
 */
const mongoURI = `mongodb+srv://arthursung98:qwer123@introfsd.xw0p9.mongodb.net/{Your desired DB name}?retryWrites=true&w=majority`;
mongoose
  .connect(mongoURI)
  .then(console.log("DB Connected!"))
  .catch((err) => {
    console.log(err);
  });

/** Step 4.
 * This is the first REST API call that we will create : Sign Up.
 * Remember we use a mongoose schema & model here in order to standardize the format
 * in which data will be inserted into the database. Although MongoDB can handle it,
 * we don't want all kinds of crazy data flying into the DB.
 * Check out the 'User.js' file under the 'models' folder to refresh on the structure of
 * a mongoose schema & model.
 */
const { User } = require("./models/User");

app.post("/signup", (req, res) => {
  // Here we are trusting that the request body will have a json format of
  // { id : some id ,
  //   password : some pw }
  const user = new User(req.body);

  // save() is a mongoose method that is used directly on a mongoose model.
  // This inserts the data into the database.
  user.save((err, doc) => {
    if (err) return res.json({ signupSuccess: false });
    return res.status(200).json({ signupSuccess: true });
  });
});

/** Step 5.
 * This is our second API call : Log In.
 * Recall that this API is a little more complex than Sign Up.
 * We know that the user will input an id and a password through the request.
 * First, we must check if the ID exists in the first place. Next, we must
 * compare the password and see if the password from the request matches
 * the password in the DB. If both those steps pass, we will create a token
 * unique to each user id, and update the user document by adding the token.
 * Then we will save that token to the cookie.
 * To clarify, creating a token is merely creating a unique identifier for
 * each user. Saving that token to the cookie is how we know which user is logged in.
 */
app.post("/login", (req, res) => {
  // 1. Check whether or not the ID exists
  User.findOne({ id: req.body.id }, (err1, user1) => {
    if (err1) return res.json({ loginSuccess: false });
    if (!user1) return res.json({ loginSuccess: false, msg: "ID not found" });

    // 2. If the ID exists, compare the input password with the one in the DB.
    user1.comparePassword(req.body.password, (err2, isMatch) => {
      if (err2) return res.json({ loginSuccess: false });
      if (!isMatch)
        return res.json({ loginSuccess: false, msg: "PW does not match!" });

      // 3. We will use a helper method that we wrote for the User model
      // called createToken. For the exact specs, refer to the 'User.js' file.
      user1.createToken((err3, user2) => {
        if (err3)
          return res.json({ loginSuccess: false, msg: "createToken err" });

        // 4. Now that we have created a unique identifier(token) for the user,
        // we will save that token to the web cookie to record which user is logged in.
        // By accessing the cookie later and comparing the token to the databse, we can
        // retrieve which exact account is logged in.
        return res
          .cookie("x_auth", user2.token)
          .status(200)
          .json({ loginSuccess: true, token: user2.token });
      });
    });
  });
});

/** Step 6.
 * We use a middleware function called 'auth.js' to check which user is logged in.
 * This API call simply checks the result of 'auth.js' and is mostly used by the developer
 * to verify that auth.js is working properly. If we ever arrive at this function body,
 * that means that we passed 'auth.js' and some user is logged in. Refer to the
 * 'auth.js' file under the middleware folder to see the exact logic.
 */
app.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    id: req.user.id,
    token: req.user.token,
  });
});

/** Step 7.
 * Here we use auth as a middleware because it is impossible to log anyone out when no one
 * has logged in yet. If we ever arrive at the function body, that means somebody is logged in
 * and we should reset the token to an empty string so that there isn't a match between the
 * token saved in the coookie and the token for the user document.
 */
app.get("/logout", auth, (req, res) => {
  User.findByIdAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ logoutSuccess: false });

    return res.status(200).json({ logoutSuccess: true });
  });
});
