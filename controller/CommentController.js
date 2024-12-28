const Comment = require("../models/CommentsModel");
const Post = require("../models/PostsModel");
const User = require("../models/Usersmodel");
const appError = require("../utils/AppError");

// create comment
const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    if (!message) {
      return next(appError("All fields are required"));
    }
    // find the post
    const post = await Post.findById(req.params.id);
    // create the comment
    const createComment = await Comment.create({
      user: req.session.authUser,
      message,
    });
    // push the comment to the post
    post.comments.push(createComment._id);
    // find the user
    const user = await User.findById(req.session.authUser);
    // push the comment
    user.comments.push(createComment._id);
    // disable validation
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
    res.redirect(`/api/v1/posts/${post?._id}`);
  } catch (error) {
    return next(appError(error.message));
  }
};

// get comment
const getCommentCtrl = async (req, res) => {
  try {
    res.json({
      status: "Success",
      user: "Comments details",
    });
  } catch (error) {
    res.json(error);
  }
};

// update comment
const updateCommentCtrl = async (req, res, next) => {
  try {
    // find the post
    const comment = await Comment.findById(req.params.id);
    // check id the post belong to login user
    if (comment.user.toString() !== req.session.authUser.toString()) {
      return next(appError("You are not allowed to update the comment", 403));
    }
    const updateComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message: req.body.message,
      },
      {
        new: true,
      }
    );
    res.json({
      status: "Success",
      data: updateComment,
    });
  } catch (error) {
    return next(appError(error.message));
  }
};

// delete comment
const deleteCommentCtrl = async (req, res, next) => {
  try {
    // find the post
    const comment = await Comment.findById(req.params.id);
    // check id the post belong to login user
    if (comment.user.toString() !== req.session.authUser.toString()) {
      return next(appError("You are not allowed to delete the comment", 403));
    }
    // delete post
    await Comment.findByIdAndDelete(req.params.id);
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    return next(appError(error.message));
  }
};
module.exports = {
  createCommentCtrl,
  getCommentCtrl,
  updateCommentCtrl,
  deleteCommentCtrl,
};
