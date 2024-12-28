const appError = require("../utils/AppError");

const protected = (req, res, next) => {
  // check if user is login
  if (req.session.authUser) {
    next();
  } else {
    res.redirect("login");
  }
};

module.exports = protected;
