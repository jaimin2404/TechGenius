const express = require("express");
const multer = require("multer");
const storage = require("../config/cloudinary");
const {
  createPostCtrl,
  getPostCtrl,
  getPostDetailCtrl,
  updatepostCtrl,
  deletePostCtrl,
} = require("../controller/PostController");
const protected = require("../middleware/Protected");
const Post = require("../models/PostsModel");
const postRoute = express.Router();

// instance of multer
const upload = multer({
  storage,
});

// create post form
postRoute.get("/add-post", (req, res) => {
  res.render("addPost", { error: "" });
});

// get post update form
postRoute.get("/updatePost/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render("updatePost", { post, error: "" });
  } catch (error) {
    res.render("updatePost", { error, post: "" });
  }
});

// create post
postRoute.post("/", protected, upload.single("file"), createPostCtrl);

// get  posts
postRoute.get("/", getPostCtrl);

// get  posts/:id
postRoute.get("/:id", getPostDetailCtrl);

// put  posts/:id
postRoute.put("/:id", protected, upload.single("file"), updatepostCtrl);

// delete  posts/:id
postRoute.delete("/:id", protected, deletePostCtrl);
module.exports = postRoute;
