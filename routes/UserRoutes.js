const express = require("express");
const multer = require("multer");
const storage = require("../config/cloudinary");
const {
  registerCtrl,
  loginCtrl,
  UserDetailsCtrl,
  userProfileCtrl,
  uploadProfileImageCtrl,
  coverImageUploadCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
} = require("../controller/UserController");
const protected = require("../middleware/Protected");
const userRoute = express.Router();

// instance of multer
const upload = multer({ storage });

// Get login routes
userRoute.get("/login", (req, res) => {
  res.render("login", {
    error: "",
  });
});

// Get signup routes
userRoute.get("/register", (req, res) => {
  res.render("register", {
    error: "",
  });
});

// // Get profile routes
// userRoute.get("/profile", (req, res) => {
//   res.render("profile");
// });

// upload-profile-image
userRoute.get("/profile-image-upload", (req, res) => {
  res.render("profile-image-upload");
});

// update password
userRoute.get("/update-password", (req, res) => {
  res.render("updatePassword", { error: "" });
});

userRoute.get("/logout", logoutCtrl);
// Get update-user routes
userRoute.get("/update-user", (req, res) => {
  res.render("updateUser", { error: error });
});

// post users login
userRoute.post("/login", loginCtrl);

// Register user
userRoute.post("/register", registerCtrl);

// get users/profile/:id
userRoute.get("/profile", protected, userProfileCtrl);

// put users/profile-image-upload/:id
userRoute.put(
  "/profile-image-upload/",
  protected,
  upload.single("profile"),
  uploadProfileImageCtrl
);

// put users/cover-image-upload/:id
userRoute.put(
  "/cover-image-upload/",
  protected,
  upload.single("profile"),
  coverImageUploadCtrl
);

// put users/update-password/:id
userRoute.put("/update-password", updatePasswordCtrl);

// put users/update
userRoute.put("/update", updateUserCtrl);

// get users/:id
userRoute.get("/:id", UserDetailsCtrl);

// get users/logout

module.exports = userRoute;
