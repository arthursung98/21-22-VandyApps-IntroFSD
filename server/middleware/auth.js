const { User } = require("../models/User");

/**
 * In JavaScript, a function definition can be saved to a variable.
 * In this function, we first access the cookie location where the token is saved.
 * Recall that a web cookie is constantly shared by all HTTP requests & resonse, so
 * we can directly access the token by 'req.cookies.x_auth.'
 */
let auth = function (req, res, next) {
  // 1. Access the token that is saved to the web cookie.
  var token = req.cookies.x_auth;

  // 2. Next, we will use a helper method that we wrote for the User model
  // called findByToken. For the exact specs, refer to the 'User.js' file.
  // If the user is found, we will attach the user information to the request
  // and return back to the API call in 'index.js'.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    // If no user is found by the given token, then that means nobody is logged in.
    // In this case, we do not have to return to the original API call.
    // We will immediately return the response with a isAuth : false.
    if (!user) return res.json({ isAuth: false });

    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };
