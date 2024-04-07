const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true; // Set a variable indicating the user is authenticated
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
};
