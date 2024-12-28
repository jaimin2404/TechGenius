const bcrypt = require("bcryptjs");
const User = require("../models/Usersmodel");
const appError = require("../utils/AppError");

// register controller
const registerCtrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  // check if filed is empty
  if (!fullname || !email || !password) {
    return res.render("register", {
      error: "* All Fields are required",
    });
  }
  try {
    // check email already exist
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.render("register", {
        error: "* User already exist",
      });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // Register user
    const user = await User.create({
      fullname,
      email,
      password: hashPassword,
    });
    req.session.authUser = user._id;
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    res.json(error);
  }
};

// login
const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("login", {
      error: "* Email and password is required",
    });
  }
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.render("login", {
        error: "* invalid login credential",
      });
    }
    const checkPassword = await bcrypt.compare(password, userFound.password);
    if (!checkPassword) {
      return res.render("login", {
        error: "* invalid login credential",
      });
    }
    // save the user info
    req.session.authUser = userFound._id;
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    res.json(error);
  }
};
// get single user
const UserDetailsCtrl = async (req, res) => {
  try {
    // get userId from params
    const userId = req.params.id;
    // find the user
    const user = await User.findById(userId);
    res.render("updateUser", { user, error: null });
  } catch (error) {
    res.json(error);
  }
};

// get profile
const userProfileCtrl = async (req, res) => {
  try {
    // gget login user
    const userId = req.session.authUser;
    // find the user
    const user = await User.findById(userId).populate("posts");
    // .populate("comments");
    res.render("profile", { user });
  } catch (error) {
    res.json(error);
  }
};

// upload profile image
const uploadProfileImageCtrl = async (req, res, next) => {
  try {
    // check if file exists
    if (!req.file) {
      return res.render("profile-image-upload", {
        error: "Please upload an image.",
      });
    }
    // find the user for update
    const userId = req.session.authUser;
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.render("profile-image-upload", {
        error: "User not found.",
      });
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        profileImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    // Pass the error message to the template
    return res.render("profile-image-upload", {
      error: error.message,
    });
  }
};

// upload cover image
const coverImageUploadCtrl = async (req, res, next) => {
  try {
    // find the user for update
    const userId = req.session.authUser;
    const userFound = await User.findByIdAndUpdate(
      userId,
      {
        coverImage: req.file.path,
      },
      {
        new: true,
      }
    );
    if (!userFound) {
      return next(appError("User not found", 403));
    }
    res.json({
      status: "Success",
      data: "Your cover image updated successfully",
    });
  } catch (error) {
    return next(appError(error.message));
  }
};

// update password
const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    // check is password is updating
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      // update password
      await User.findByIdAndUpdate(
        req.session.authUser,
        {
          password: hashPassword,
        },
        { new: true }
      );
    }
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return res.render("updatePassword", {
      error: error.message,
    });
  }
};

// Update user
const updateUserCtrl = async (req, res, next) => {
  const { fullname, email } = req.body;
  try {
    if (!fullname || !email) {
      return res.render("updateUser", {
        error: "please provide details",
        user: "",
      });
    }
    // check if email already exists
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.render("updateUser", {
        error: "Email already taken",
        user: "",
      });
    }
    // update user
    const user = await User.findByIdAndUpdate(
      req.session.authUser,
      {
        fullname,
        email,
      },
      {
        new: true,
      }
    );
    // Redirect to the profile page
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return res.render("updateUser", {
      error: error.message, // Make sure you are passing the error here
      user: "",
    });
  }
};

// logout
const logoutCtrl = async (req, res) => {
  // destroy session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};

module.exports = {
  registerCtrl,
  loginCtrl,
  UserDetailsCtrl,
  userProfileCtrl,
  uploadProfileImageCtrl,
  coverImageUploadCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
};
