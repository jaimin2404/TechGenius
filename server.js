require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const app = express();
const dbConnect = require("./config/Database");
const userRoute = require("./routes/UserRoutes");
const postRoute = require("./routes/PostRoutes");
const commentRoute = require("./routes/CommentRoutes");
const globalErrorHandler = require("./middleware/GlobalErrorHandler");
const Post = require("./models/PostsModel");
const { truncatePost } = require("./utils/helper");

// database connection
dbConnect();

// configur ejs
app.set("view engine", "ejs");

// server static files
app.use(express.static(__dirname + "/public"));

// pass incoming data
app.use(express.json());
// pass form data
app.use(express.urlencoded({ extended: true }));

// helpers
app.locals.truncatePost = truncatePost;

// ? Middlewares

// methdo override
app.use(methodOverride("_method"));

// session config
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
      mongoUrl: process.env.DB_URL,
      ttl: 24 * 60 * 60, //1 day
    }),
  })
);

// save login user in locals
app.use((req, res, next) => {
  if (req.session.authUser) {
    res.locals.authUser = req.session.authUser;
  } else {
    res.locals.authUser = null;
  }
  next();
});

// render home
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user");
    // const authUser = req.user;
    res.render("index", {
      posts,
      // authUser: authUser, // Pass authUser to the template
    });
  } catch (error) {
    res.render("index", {
      authUser: authUser,
      error: error.message, // Pass authUser to the template
    });
  }
});
// *  routes
// ------ User Route ------
app.use("/api/v1/users", userRoute);

// ------ Post Routes
app.use("/api/v1/posts", postRoute);

// ------ Comment Routes
app.use("/api/v1/comments", commentRoute);

// ! exrror handler middlewares
app.use(globalErrorHandler);

// ? listen server
const port = process.env.PORT || 9000;
app.listen(port, console.log(`Server is running on port : ${port}`));
