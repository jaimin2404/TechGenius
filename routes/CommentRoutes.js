const express = require("express");
const {
  createCommentCtrl,
  getCommentCtrl,
  updateCommentCtrl,
  deleteCommentCtrl,
} = require("../controller/CommentController");
const protected = require("../middleware/Protected");
const commentRoute = express.Router();

// post  comments
commentRoute.post("/:id", protected, createCommentCtrl);

// get  comments/:id
commentRoute.get("/:id", getCommentCtrl);

// put  comments/:id
commentRoute.put("/:id", protected, updateCommentCtrl);

// delete  comments/:id
commentRoute.delete("/:id", protected, deleteCommentCtrl);

module.exports = commentRoute;
