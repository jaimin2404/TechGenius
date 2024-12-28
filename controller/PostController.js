const Comment = require("../models/CommentsModel");
const Post = require("../models/PostsModel");
const User = require("../models/Usersmodel");
const appError = require("../utils/AppError");

// create post
const createPostCtrl = async (req, res, next) => {
  const { title, description, category, user } = req.body;
  try {
    if (!title || !description || !category || !req.file) {
      return res.render("addPost", { error: "All fileds are required" });
    }
    // find the user
    const userId = await req.session.authUser;
    const userFound = await User.findById(userId);
    // create post
    const postCreate = await Post.create({
      title,
      description,
      category,
      user: userId,
      image: req.file.path,
    });
    // push the post created into the user
    userFound.posts.push(postCreate._id);
    // resave
    await userFound.save();
    // redirect to profile page
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return res.render("addPost", { error: error.message });
  }
};
// get post list
const getPostCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("comments").populate("user");
    res.json({
      status: "Success",
      data: posts,
    });
  } catch (error) {
    return next(appError(error.message));
  }
};

// get post details
const getPostDetailCtrl = async (req, res, next) => {
  try {
    // get id
    const id = req.params.id;
    // get post details
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate("user");
    res.render("postDetails", { post, error: "" });
  } catch (error) {
    res.json(error);
  }
};

// update post
const updatepostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    // find the post
    const post = await Post.findById(req.params.id);

    // check if user updating image
    if (req.file) {
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
          image: req.file.path,
        },
        {
          new: true,
        }
      );
    } else {
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
        },
        {
          new: true,
        }
      );
    }
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return next(appError(error.message));
  }
};

// delete post
const deletePostCtrl = async (req, res, next) => {
  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // check id the post belong to login user
    if (post.user.toString() !== req.session.authUser.toString()) {
      return res.render("profile", {
        error: "You are not allowed to delete the post",
        post,
      });
    }
    // delete post
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return res.render("profile", {
      error: error.message,
      post: "",
    });
  }
};
module.exports = {
  createPostCtrl,
  getPostCtrl,
  getPostDetailCtrl,
  updatepostCtrl,
  deletePostCtrl,
};
