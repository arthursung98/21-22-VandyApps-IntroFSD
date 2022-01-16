const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

/**
 * This is a Mongoose Schema, a blueprint of what the model will look like.
 * A Mongoose model is just an actual instance of the schema.
 * Think of Java Classes and Java Objects. An object is an instance of the class.
 */
const userSchema = mongoose.Schema({
  id: {
    type: String,
  },
  password: {
    type: String,
  },
  token: {
    type: String,
  },
});

/**
 * This method is a helper function for Log In, to compare 2 passwords :
 * one saved in the database, and one passed through the request from the user.
 * @param inputPassword - The password given through the request from the user.
 * @param cb - A callback function with the first parameter as any errors that occured,
 * and the second parameter as the result of the password matching.
 * Recall that in JS a function can be passed as a parameter.
 * @returns The results of comparePassword will be passed as parameters for the next
 * callback function from the original caller.
 */
userSchema.methods.comparePassword = function (inputPassword, cb) {
  var user = this;

  if (inputPassword === user.password) return cb(null, true);
  else return cb(null, false);
};

/**
 * This method is a helper function for Log In, to create a unique token for
 * the user id.
 * @param cb - A callback function with the first parameter as any errors that occured,
 * and the second parameter as the updated user document.
 */
userSchema.methods.createToken = function (cb) {
  var user = this;
  // Recall jsonwebtoken.sign() will take a unique identifier and a secret string to
  // encrypt the id.
  var token = jwt.sign(user._id.toHexString(), "fsd");

  user.token = token;

  user.save((err, user) => {
    if (err) return cb(err, null);
    return cb(null, user);
  });
};

/**
 * This method is a helper function for Auth, to find a user document with the
 * token saved in a cookie.
 * @param token - The token saved in the Web cookie.
 * @param cb - A callback function with the first parameter as any errors that occured,
 * and the second parameter as the user document.
 */
userSchema.statics.findByToken = function (token, cb) {
  jwt.verify(token, "fsd", (err, decoded) => {
    // What does decoded actually mean?
    User.findOne({ _id: decoded }, (err, user) => {
      if (err) return cb(err, null);
      if (!user) return cb(err, null);

      return cb(null, user);
    });
  });
};

const User = mongoose.model("user", userSchema);
module.exports = { User };
